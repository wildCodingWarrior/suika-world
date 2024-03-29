"use client";

import React, { useRef, useEffect } from "react";
import Matter from "matter-js";
import { balls } from "../utils/constant";
import useSound from "../hooks/useSound";

const originWidthHeight = 2040;

const GameBoard = () => {
  const canvasRef = useRef(null);
  const playSound = useSound("/sound.mp3", 10, 0.2); // useSound 훅 사용

  function getNextRadius(radius) {
    const index = balls.findIndex((ball) => ball.radius === radius);
    if (index === -1 || index === balls.length - 1) {
      return balls[0].radius;
    } else {
      return balls[index + 1].radius;
    }
  }

  function getImageByRadius(radius) {
    const index = balls.findIndex((ball) => ball.radius === radius);
    if (index === -1) {
      return balls[0].imageUrl;
    } else {
      return balls[index].imageUrl;
    }
  }

  useEffect(() => {
    const { Engine, Render, World, Bodies, Events } = Matter;

    const engine = Engine.create();
    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: 400,
        height: 700,
        wireframes: false,
        hasBounds: true, // 텍스트 렌더링을 위해 hasBounds 속성을 true로 설정
        textured: true, // 텍스트 렌더링을 위해 textured 속성을 true로 설정
      },
    });

    const leftWall = Bodies.rectangle(0, 350, 1, 700, { isStatic: true });
    const rightWall = Bodies.rectangle(400, 350, 1, 700, { isStatic: true });
    const ground = Bodies.rectangle(200, 670, 400, 60, { isStatic: true });
    const ceiling = Bodies.rectangle(200, 0, 400, 1, { isStatic: true });

    World.add(engine.world, [ceiling, leftWall, rightWall, ground]);

    Events.on(engine, "collisionStart", (event) => {
      const pairs = event.pairs;

      pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // 공과 천장이 충돌한 경우
        if (
          (bodyA === ceiling && bodyB.circleRadius) ||
          (bodyB === ceiling && bodyA.circleRadius)
        ) {
          // alert("앗.. 천장에 닿아버렸다.. ㅠㅠ");
          // // 모든 공 제거
          // World.clear(engine.world, false);
          // World.add(engine.world, [leftWall, rightWall, ground, ceiling]);
        }

        if (
          bodyA.circleRadius &&
          bodyB.circleRadius &&
          bodyA.circleRadius === bodyB.circleRadius
        ) {
          const newRadius = getNextRadius(bodyA.circleRadius);
          const newX = (bodyA.position.x + bodyB.position.x) / 2;
          const newY = (bodyA.position.y + bodyB.position.y) / 2;
          const newCircle = Bodies.circle(newX, newY, newRadius, {
            render: {
              sprite: {
                texture: getImageByRadius(newRadius),
                xScale: (newRadius * 2) / originWidthHeight,
                yScale: (newRadius * 2) / originWidthHeight,
              },
            },
          });

          playSound();
          World.add(engine.world, newCircle);
          World.remove(engine.world, bodyA);
          World.remove(engine.world, bodyB);

          if (newRadius === 194) {
            alert("수박을 만들었다! 승리!");
            // 모든 공 제거
            World.clear(engine.world, false);
            World.add(engine.world, [leftWall, rightWall, ground, ceiling]);
          }
        }
      });
    });

    Engine.run(engine);
    Render.run(render);

    const addBallOnClick = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = rect.top;

      // Select Random Radius from
      const targetRadius = [20, 25, 32];
      const randomRadius =
        targetRadius[Math.floor(Math.random() * targetRadius.length)];

      const ball = Bodies.circle(x, y, randomRadius, {
        render: {
          sprite: {
            texture: getImageByRadius(randomRadius),
            xScale: (randomRadius * 2) / originWidthHeight,
            yScale: (randomRadius * 2) / originWidthHeight,
          },

          // fillStyle: getColorByRadius(randomRadius),
        },
      });
      World.add(engine.world, ball);
    };

    canvasRef.current.addEventListener("click", addBallOnClick);

    return () => {
      Render.stop(render);
      World.clear(engine.world);
      Engine.clear(engine);

      canvasRef.current.removeEventListener("click", addBallOnClick);
    };
  }, []);

  return <canvas ref={canvasRef} />;
};

export default GameBoard;
