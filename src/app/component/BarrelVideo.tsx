"use client";

import { useEffect, useRef } from "react";

interface BarrelVideoProps {
  src: string;
  distortion?: number;
  edgeSoftness?: number;
  zoom?: number;
  glow?: boolean;
  glowOpacity?: number;
  glowBlur?: number;
}

export default function BarrelVideo({
  src,
  distortion = 0.85,
  edgeSoftness = 0.02,
  zoom = 0.85,
  glow = true,
  glowOpacity = 0.3,
  glowBlur = 70,
}: BarrelVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: true,
    });

    if (!gl) {
      console.error("WebGL is not supported.");
      return;
    }

    // =====================================================
    // VIDEO
    // =====================================================

    const video = document.createElement("video");

    video.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    const playVideo = () => {
      void video.play().catch(() => {
        // Browser may block autoplay until user interaction.
      });
    };

    video.addEventListener("loadeddata", playVideo);

    // =====================================================
    // SHADERS
    // =====================================================

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_uv;

      varying vec2 v_uv;

      void main() {
        v_uv = a_uv;

        gl_Position = vec4(
          a_position,
          0.0,
          1.0
        );
      }
    `;

    const fragmentShaderSource = `
      precision highp float;

      uniform sampler2D u_texture;
      uniform float u_distortion;
      uniform float u_edgeSoftness;
      uniform float u_zoom;

      varying vec2 v_uv;

      void main() {

        // ================================================
        // BARREL FRAME
        // ================================================

        vec2 centeredUV = v_uv - 0.5;

        float distanceFromCenter =
          dot(centeredUV, centeredUV);

        vec2 frameUV =
          centeredUV *
          (
            1.0 +
            u_distortion *
            distanceFromCenter
          );

        frameUV += 0.5;


        // ================================================
        // SOFT EDGES
        // ================================================

        float left =
          smoothstep(
            0.0,
            u_edgeSoftness,
            frameUV.x
          );

        float right =
          smoothstep(
            0.0,
            u_edgeSoftness,
            1.0 - frameUV.x
          );

        float top =
          smoothstep(
            0.0,
            u_edgeSoftness,
            frameUV.y
          );

        float bottom =
          smoothstep(
            0.0,
            u_edgeSoftness,
            1.0 - frameUV.y
          );

        float edgeAlpha =
          left *
          right *
          top *
          bottom;


        // ================================================
        // VIDEO STAYS FLAT
        // ================================================

        vec2 videoUV =
          vec2(
            v_uv.x,
            1.0 - v_uv.y
          );

        videoUV =
          (videoUV - 0.5)
          * u_zoom
          + 0.5;


        // ================================================
        // VIDEO
        // ================================================

        vec4 color =
          texture2D(
            u_texture,
            videoUV
          );


        // ================================================
        // OUTPUT
        // ================================================

        gl_FragColor =
          vec4(
            color.rgb,
            edgeAlpha
          );
      }
    `;

    // =====================================================
    // SHADER CREATION
    // =====================================================

    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);

      if (!shader) {
        console.error("Could not create shader.");
        return null;
      }

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

      if (!compiled) {
        console.error("Shader compilation error:", gl.getShaderInfoLog(shader));

        gl.deleteShader(shader);

        return null;
      }

      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);

    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    if (!vertexShader || !fragmentShader) {
      return;
    }

    // =====================================================
    // PROGRAM
    // =====================================================

    const program = gl.createProgram();

    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (!linked) {
      console.error("Program linking error:", gl.getProgramInfoLog(program));

      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      return;
    }

    gl.useProgram(program);

    // =====================================================
    // QUAD
    // =====================================================

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,

      -1, 1, 1, -1, 1, 1,
    ]);

    const uvs = new Float32Array([
      0, 0, 1, 0, 0, 1,

      0, 1, 1, 0, 1, 1,
    ]);

    // =====================================================
    // POSITION BUFFER
    // =====================================================

    const positionBuffer = gl.createBuffer();

    if (!positionBuffer) {
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    if (positionLocation === -1) {
      console.error("a_position attribute not found.");
      return;
    }

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // =====================================================
    // UV BUFFER
    // =====================================================

    const uvBuffer = gl.createBuffer();

    if (!uvBuffer) {
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    const uvLocation = gl.getAttribLocation(program, "a_uv");

    if (uvLocation === -1) {
      console.error("a_uv attribute not found.");
      return;
    }

    gl.enableVertexAttribArray(uvLocation);

    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    // =====================================================
    // TEXTURE
    // =====================================================

    const texture = gl.createTexture();

    if (!texture) {
      return;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // =====================================================
    // BLENDING
    // =====================================================

    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // =====================================================
    // UNIFORMS
    // =====================================================

    const distortionLocation = gl.getUniformLocation(program, "u_distortion");

    const softnessLocation = gl.getUniformLocation(program, "u_edgeSoftness");

    const zoomLocation = gl.getUniformLocation(program, "u_zoom");

    if (distortionLocation !== null) {
      gl.uniform1f(distortionLocation, distortion);
    }

    if (softnessLocation !== null) {
      gl.uniform1f(softnessLocation, edgeSoftness);
    }

    if (zoomLocation !== null) {
      gl.uniform1f(zoomLocation, zoom);
    }

    // =====================================================
    // RESIZE
    // =====================================================

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));

      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      canvas.width = width;
      canvas.height = height;

      gl.viewport(0, 0, width, height);
    };

    resize();

    window.addEventListener("resize", resize);

    // =====================================================
    // RENDER
    // =====================================================

    let animationFrame = 0;
    let destroyed = false;

    const render = () => {
      if (destroyed) return;

      animationFrame = requestAnimationFrame(render);

      gl.clearColor(0, 0, 0, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          video,
        );

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    };

    render();

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      destroyed = true;

      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resize);

      video.removeEventListener("loadeddata", playVideo);

      video.pause();
      video.removeAttribute("src");
      video.load();

      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(uvBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [src, distortion, edgeSoftness, zoom]);

  return (
    <div className="absolute inset-0">
      {glow && (
        <div
          className="absolute pointer-events-none"
          style={{
            inset: "-8%",
            borderRadius: "40%",
            background: "rgba(255,255,255,0.2)",
            filter: `blur(${glowBlur}px)`,
            opacity: glowOpacity,
          }}
        />
      )}

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
