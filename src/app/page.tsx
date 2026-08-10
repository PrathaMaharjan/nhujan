"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// import Preloader from "./component/preloader";


export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    function handlePointerMove(e: PointerEvent) {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;

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

    video.src = "/assets/ShowreelDraft.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    video.play().catch(() => {});

    // =====================================================
    // VERTEX SHADER
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

    // =====================================================
    // FRAGMENT SHADER
    // =====================================================

    const fragmentShaderSource = `
      precision highp float;

      uniform sampler2D u_texture;
      uniform float u_distortion;

      varying vec2 v_uv;

      void main() {

        // -----------------------------------------------
        // USE DISTORTION ONLY FOR THE FRAME BOUNDARY
        // -----------------------------------------------

        vec2 centeredUV = v_uv - 0.5;

        float distanceFromCenter =
          dot(centeredUV, centeredUV);

        vec2 frameUV =
          centeredUV *
          (1.0 + u_distortion * distanceFromCenter);

        frameUV += 0.5;


        // -----------------------------------------------
        // TRANSPARENT OUTSIDE BARREL FRAME
        // -----------------------------------------------

        // if (
        //   frameUV.x < 0.0 ||
        //   frameUV.x > 1.0 ||
        //   frameUV.y < 0.0 ||
        //   frameUV.y > 1.0
        // ) {
        //   gl_FragColor =
        //     vec4(0.0, 0.0, 0.0, 0.0);

        //   return;
        // }
// ================================================
// SOFT SCREEN EDGES
// ================================================

float edgeLeft   = smoothstep(0.0, 0.01, frameUV.x);
float edgeRight  = smoothstep(0.0, 0.01, 1.0 - frameUV.x);

float edgeTop    = smoothstep(0.0, 0.005, frameUV.y);
float edgeBottom = smoothstep(0.0, 0.005, 1.0 - frameUV.y);

float edgeAlpha =
  edgeLeft *
  edgeRight *
  edgeTop *
  edgeBottom;

        // -----------------------------------------------
        // VIDEO IS NOT DISTORTED
        //
        // Sample the ORIGINAL UV coordinates.
        // Only flip Y because WebGL texture coordinates
        // are opposite to normal video coordinates.
        // -----------------------------------------------

        vec2 videoUV = vec2(v_uv.x, 1.0 - v_uv.y);
        //Make video bigger (zoom in)
float zoom = 0.85; // >1 = bigger, <1 = smaller
videoUV = (videoUV - 0.5) * zoom + 0.5;
vec4 color = texture2D(u_texture, videoUV);


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

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);

      if (!shader) {
        throw new Error("Could not create shader.");
      }

      gl!.shaderSource(shader, source);

      gl!.compileShader(shader);

      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
      }

      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);

    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    // =====================================================
    // PROGRAM
    // =====================================================

    const program = gl.createProgram();

    if (!program) {
      throw new Error("Could not create WebGL program.");
    }

    gl.attachShader(program, vertexShader);

    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    // =====================================================
    // FULLSCREEN QUAD
    // =====================================================

    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,

      -1, 1, 1, -1, 1, 1,
    ]);

    const uvs = new Float32Array([
      0, 0, 1, 0, 0, 1,

      0, 1, 1, 0, 1, 1,
    ]);

    // Position buffer

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // UV buffer

    const uvBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);

    const uvLocation = gl.getAttribLocation(program, "a_uv");

    gl.enableVertexAttribArray(uvLocation);

    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 0, 0);

    // =====================================================
    // VIDEO TEXTURE
    // =====================================================

    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // =====================================================
    // TRANSPARENCY
    // =====================================================

    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // =====================================================
    // BARREL STRENGTH
    // =====================================================

    const distortionLocation = gl.getUniformLocation(program, "u_distortion");

    gl.uniform1f(distortionLocation, 0.85);

    // =====================================================
    // RESIZE
    // =====================================================

    function resize() {
      if (!canvas) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = canvas.clientWidth * dpr;

      canvas.height = canvas.clientHeight * dpr;

      gl!.viewport(0, 0, canvas.width, canvas.height);
    }

    resize();

    window.addEventListener("resize", resize);

    // =====================================================
    // RENDER LOOP
    // =====================================================

    let animationFrame = 0;

    function render() {
      animationFrame = requestAnimationFrame(render);

      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl!.bindTexture(gl!.TEXTURE_2D, texture);

        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RGBA,
          gl!.RGBA,
          gl!.UNSIGNED_BYTE,
          video,
        );
      }

      // Transparent canvas

      gl!.clearColor(0, 0, 0, 0);

      gl!.clear(gl!.COLOR_BUFFER_BIT);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
    }

    render();

    // =====================================================
    // CLEANUP
    // =====================================================

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("resize", resize);

      video.pause();
      video.removeAttribute("src");
      video.load();

      if (texture) {
        gl.deleteTexture(texture);
      }

      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, [isLoading]);

  // =======================================================
  // PRELOADER
  // =======================================================

  // if (isLoading) {
  //   return <Preloader />;
  // }

  // =======================================================
  // PAGE
  // =======================================================

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#000]">
      {/* =================================================
          SHOWREEL
      ================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          w-[75vw]
          max-w-[1920px]
          aspect-video
           transition-transform
    duration-300
    ease-out
  "
        // style={{
        //   transform: `translate(-50%, -50%) translate(${(mousePos.x - 0.5) * 20}px, ${(mousePos.y - 0.5) * 20}px)`,
        // }}
      >
        {/* TV GLOW */}
        <div
          className="
      absolute
      inset-[-7%]
      rounded-[15%]
      bg-white/25
      blur-[50px]
      opacity-32
      scale-[0.85]
      pointer-events-none
    "
        />
        <canvas
          ref={canvasRef}
          className="
            absolute
            inset-0
            h-full
            w-full
          "
        />
        {/* CRT VIGNETTE */}

        {/* <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[2]
          "
          style={{
            background: `
              radial-gradient(
                ellipse at center,
                transparent 48%,
                rgba(0,0,0,0.08) 68%,
                rgba(0,0,0,0.35) 100%
              )
            `,
          }}
        /> */}

        {/* CRT SCANLINES */}

        {/* <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-[3]
            opacity-[0.07]
          "
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                to bottom,
                rgba(255,255,255,0.4) 0px,
                rgba(255,255,255,0.4) 1px,
                transparent 1px,
                transparent 4px
              )
            `,
          }}
        /> */}
      </div>

      {/* =================================================
          CONTENT / NAVIGATION
      ================================================== */}
   
    </main>
  );
}
