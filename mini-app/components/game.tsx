"use client";

import { useEffect, useRef, useState } from "react";
import PaddleControls from "./paddle-controls";

const BOARD_SIZE = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 20;
const BALL_SPEED = 2;

export default function Game() {
  const [gameState, setGameState] = useState<
    "start" | "playing" | "ended"
  >("start");
  const [score, setScore] = useState(0);
  const [ballPos, setBallPos] = useState({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
  const [ballVel, setBallVel] = useState({ x: BALL_SPEED, y: BALL_SPEED });
  const [playerPaddleY, setPlayerPaddleY] = useState(BOARD_SIZE / 2 - PADDLE_HEIGHT / 2);
  const [computerPaddleY, setComputerPaddleY] = useState(BOARD_SIZE / 2 - PADDLE_HEIGHT / 2);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetGame = () => {
    setBallPos({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 });
    setBallVel({ x: BALL_SPEED, y: BALL_SPEED });
    setPlayerPaddleY(BOARD_SIZE / 2 - PADDLE_HEIGHT / 2);
    setComputerPaddleY(BOARD_SIZE / 2 - PADDLE_HEIGHT / 2);
    setScore(0);
    setGameState("start");
  };

  const startGame = () => {
    setGameState("playing");
  };

  const endGame = () => {
    setGameState("ended");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    intervalRef.current = setInterval(() => {
      setBallPos((prev) => {
        let newX = prev.x + ballVel.x;
        let newY = prev.y + ballVel.y;

        // Top and bottom collision
        if (newY <= 0 || newY + BALL_SIZE >= BOARD_SIZE) {
          setBallVel((v) => ({ ...v, y: -v.y }));
          newY = prev.y + ballVel.y;
        }

        // Left paddle collision
        if (
          newX <= PADDLE_WIDTH &&
          newY + BALL_SIZE >= playerPaddleY &&
          newY <= playerPaddleY + PADDLE_HEIGHT
        ) {
          setBallVel((v) => ({ ...v, x: -v.x }));
          setScore((s) => s + 1);
          newX = prev.x + ballVel.x;
        }

        // Right paddle collision
        if (
          newX + BALL_SIZE >= BOARD_SIZE - PADDLE_WIDTH &&
          newY + BALL_SIZE >= computerPaddleY &&
          newY <= computerPaddleY + PADDLE_HEIGHT
        ) {
          setBallVel((v) => ({ ...v, x: -v.x }));
          setScore((s) => s + 1);
          newX = prev.x + ballVel.x;
        }

        // Left or right out of bounds
        if (newX < 0 || newX > BOARD_SIZE) {
          endGame();
          return prev;
        }

        return { x: newX, y: newY };
      });

      // Computer paddle follows ball
      setComputerPaddleY((prev) => {
        const target = ballPos.y - PADDLE_HEIGHT / 2;
        const diff = target - prev;
        const step = Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED);
        return prev + step;
      });
    }, 16);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gameState, ballVel, ballPos]);

  const movePlayer = (dir: "up" | "down") => {
    setPlayerPaddleY((prev) => {
      const step = dir === "up" ? -PADDLE_SPEED : PADDLE_SPEED;
      const newPos = prev + step;
      if (newPos < 0) return 0;
      if (newPos + PADDLE_HEIGHT > BOARD_SIZE) return BOARD_SIZE - PADDLE_HEIGHT;
      return newPos;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {gameState === "start" && (
        <button
          className="bg-yellow-400 text-black px-4 py-2 rounded"
          onClick={startGame}
        >
          Start Game
        </button>
      )}
      <div
        className="relative bg-green-500"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
      >
        {/* Player paddle */}
        <div
          className="absolute bg-purple-800"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            left: 0,
            top: playerPaddleY,
          }}
        />
        {/* Computer paddle */}
        <div
          className="absolute bg-purple-800"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            right: 0,
            top: computerPaddleY,
          }}
        />
        {/* Ball */}
        <div
          className="absolute bg-white"
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            left: ballPos.x,
            top: ballPos.y,
          }}
        />
      </div>
      {gameState === "playing" && (
        <PaddleControls onUp={() => movePlayer("up")} onDown={() => movePlayer("down")} />
      )}
      {gameState === "ended" && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xl">Score: {score}</span>
          <button
            className="bg-yellow-400 text-black px-4 py-2 rounded"
            onClick={resetGame}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
