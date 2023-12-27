import { Flex } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

const tasks = [
  { type: 'algorithm', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'algorithm', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'maze', element: undefined },
  { type: 'algorithm', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'maze', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'maze', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
  { type: 'quiz', element: undefined },
];

export const TrailCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const div = divRef.current;
    if (!canvas || !div) return;

    const ctx = canvas.getContext('2d');

    canvas.width = 1000;
    canvas.height = window.innerHeight * 2;

    const itemsArray = [
      { direction: 'down', distance: 0 },
      { direction: 'right', distance: 200 },
      { direction: 'right', distance: 200 },
      { direction: 'right', distance: 200 },
      { direction: 'right', distance: 200 },
      { direction: 'up', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'up', distance: 200 },
      { direction: 'right', distance: 200 },
      { direction: 'right', distance: 200 },
      { direction: 'up', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'left', distance: 200 },
      { direction: 'up', distance: 200 },
    ];

    let currentX = 50; // Initial X position
    let currentY = canvas.height - 30; // Initial Y position
    let currentItemIndex = 0;

    function animate() {
      const item = itemsArray[currentItemIndex];

      switch (item.direction) {
        case 'down':
          drawLineAndCircle(currentX, currentY, currentX, currentY + item.distance, tasks[currentItemIndex]);
          currentY += item.distance;
          break;
        case 'right':
          drawLineAndCircle(currentX, currentY, currentX + item.distance, currentY, tasks[currentItemIndex]);
          currentX += item.distance;
          break;
        case 'left':
          drawLineAndCircle(currentX, currentY, currentX - item.distance, currentY, tasks[currentItemIndex]);
          currentX -= item.distance;
          break;
        case 'up':
          drawLineAndCircle(currentX, currentY, currentX, currentY - item.distance, tasks[currentItemIndex]);
          currentY -= item.distance;
          break;
      }

      currentItemIndex = (currentItemIndex + 1) % itemsArray.length;

      if (currentItemIndex >= itemsArray.length - 1) return;
      requestAnimationFrame(animate);
    }

    function drawLineAndCircle(startX: number, startY: number, endX: number, endY: number, task: (typeof tasks)[number]): void {
      if (!ctx || !div) return;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.strokeStyle = '#1A1740';
      ctx.closePath();

      ctx.beginPath();
      const newElement = document.createElement('div');
      newElement.style.width = '2rem';
      newElement.style.height = '2rem';
      newElement.style.backgroundColor = '#1A1740';
      newElement.style.borderRadius = '8px';
      newElement.style.display = 'flex';
      newElement.style.alignItems = 'center';
      newElement.style.justifyContent = 'center';
      newElement.style.position = 'absolute';
      newElement.style.left = `${endX - 16}px`;
      newElement.style.top = `${endY - 16}px`;
      if (task.type === 'maze') newElement.style.padding = '4px';
      newElement.innerHTML = `<img src="/icons/${task.type}.svg" />`;
      div?.appendChild(newElement);

      // ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
      // ctx.fillStyle = 'blue';
      // ctx.fill();
      ctx.closePath();
    }

    animate();

    divRef.current.scrollTo({ top: 1e6 });
  });
  return (
    <Flex ref={divRef} overflow="hidden auto" height="100%" margin="auto" position="relative">
      <canvas ref={canvasRef} id="trailCanvas" style={{ display: 'block', backgroundColor: '#f0f0f0', margin: 'auto' }} />
    </Flex>
  );
};
