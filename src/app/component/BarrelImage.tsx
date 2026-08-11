"use client";

import { useEffect, useRef } from "react";

interface BarrelImageProps {
  src: string;
  alt?: string;
  distortion?: number;
  edgeSoftness?: number;
  zoom?: number;
  glow?: boolean;
}

export default function BarrelImage({
  src,
  alt = "",
  distortion = 0.85,
  edgeSoftness = 0.02,
  zoom = 1,
  glow = false,
}: BarrelImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
    });

    if (!gl) return;

    const image = new Image();

    image.crossOrigin = "anonymous";
    image.src = src;

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_uv;

      varying vec2 v_uv;

      void main() {
        v_uv = a_uv;
        gl_Position = vec4(a_position, 0.0, 1.0);
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

        vec2 centered =
          v_uv - 0.5;

        float d =
          dot(centered, centered);

        // BARREL FRAME
        vec2 frameUV =
          centered *
          (1.0 + u_distortion * d);

        frameUV += 0.5;

        // SOFT EDGES
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

        float alpha =
          left *
          right *
          top *
          bottom;

        // IMAGE STAYS FLAT
        vec2 imageUV =
          (v_uv - 0.5) *
          u_zoom +
          0.5;

        vec4 color =
          texture2D(
            u_texture,
            imageUV
          );

        gl_FragColor =
          vec4(
            color.rgb,
            alpha
          );
      }
    `;

    const createShader = (type: number, source: string): WebGLShader | null => {
      const shader = gl.createShader(type);

      if (!shader) return null;

      gl.shaderSource(shader, source);

      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));

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

    const program = gl.createProgram();

    if (!program) return;

    gl.attachShader(program, vertexShader);

    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));

      return;
    }

    gl.useProgram(program);

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,

      -1, 1, 1, -1, 1, 1,
    ]);

    const uvs = new Float32Array([
      0, 0, 1, 0, 0, 1,

      0, 1, 1, 0, 1, 1,
    ]);

    const positionBuffer = gl.createBuffer();

    const uvBuffer = gl.createBuffer();

    if (!positionBuffer || !uvBuffer) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    const uvLocation = gl.getAttribLocation(program, "a_uv");

    gl.enableVertexAttribArray(uvLocation);

    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();

    if (!texture) return;

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const distortionLocation = gl.getUniformLocation(program, "u_distortion");

    const softnessLocation = gl.getUniformLocation(program, "u_edgeSoftness");

    const zoomLocation = gl.getUniformLocation(program, "u_zoom");

    if (distortionLocation) {
      gl.uniform1f(distortionLocation, distortion);
    }

    if (softnessLocation) {
      gl.uniform1f(softnessLocation, edgeSoftness);
    }

    if (zoomLocation) {
      gl.uniform1f(zoomLocation, zoom);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = canvas.clientWidth * dpr;

      canvas.height = canvas.clientHeight * dpr;

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();

    window.addEventListener("resize", resize);

    let frame = 0;

    const render = () => {
      frame = requestAnimationFrame(render);

      if (image.complete) {
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
      }

      gl.clearColor(0, 0, 0, 0);

      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    render();

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("resize", resize);

      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(uvBuffer);
    };
  }, [src, distortion, edgeSoftness, zoom]);

  return (
    <div className="absolute inset-0">
      {glow && (
        <div
          className="
            absolute
            inset-[-8%]
            rounded-[40%]
            bg-white/20
            blur-[60px]
            opacity-25
            pointer-events-none
          "
        />
      )}

      <canvas
        ref={canvasRef}
        aria-label={alt}
        className="
          absolute
          inset-0
          w-full
          h-full
        "
      />
    </div>
  );
}
