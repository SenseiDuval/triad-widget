import React, { useState } from 'react';

export type Card = {
  id: string;
  name: string;
  sides: [number, number, number, number];
  owner: 'A' | 'B';
};

const SAMPLE_DECK_A: Card[] = [
  { id: 'a1', name: 'Alpha', sides: [5, 2, 1, 3], owner: 'A' },
  { id: 'a2', name: 'Beta', sides: [2, 3, 4, 5], owner: 'A' },
  { id: 'a3', name: 'Gamma', sides: [4, 4, 2, 1], owner: 'A' },
  { id: 'a4', name: 'Delta', sides: [1, 5, 3, 2], owner: 'A' },
  { id: 'a5', name: 'Epsilon', sides: [3, 1, 5, 4], owner: 'A' }
];

const SAMPLE_DECK_B: Card[] = [
  { id: 'b1', name: 'Sigma', sides: [2, 5, 3, 1], owner: 'B' },
  { id: 'b2', name: 'Tau', sides: [5, 1, 4, 2], owner: 'B' },
  { id: 'b3', name: 'Upsilon', sides: [1, 2, 3, 5], owner: 'B' },
  { id: 'b4', name: 'Phi', sides: [4, 3, 1, 2], owner: 'B' },
  { id: 'b5', name: 'Omega', sides: [3, 4, 2, 5], owner: 'B' }
];

type BoardSlot = {
  card: Card | null;
  owner: 'A' | 'B' | null;
};

const createEmptyBoard = (): BoardSlot[] => {
  return Array.from({ length: 9 }, () => ({ card: null, owner: null }));
};

function applyMove(board: BoardSlot[], pos: number, card: Card): BoardSlot[] {
  const newBoard: BoardSlot[] = board.map((slot) => ({ ...slot }));
  newBoard[pos] = { card, owner: card.owner };
  const [t, r, b, l] = card.sides;
  const owner = card.owner;
  // left
  if (pos % 3 !== 0) {
    const leftIdx = pos - 1;
    const neighbour = newBoard[leftIdx];
    if (neighbour.card && neighbour.owner && neighbour.owner !== owner) {
      const neighbourRight = neighbour.card.sides[1];
      if (l > neighbourRight) neighbour.owner = owner;
    }
  }
  // right
  if (pos % 3 !== 2) {
    const rightIdx = pos + 1;
    const neighbour = newBoard[rightIdx];
    if (neighbour.card && neighbour.owner && neighbour.owner !== owner) {
      const neighbourLeft = neighbour.card.sides[3];
      if (r > neighbourLeft) neighbour.owner = owner;
    }
  }
  // top
  if (pos >= 3) {
    const topIdx = pos - 3;
    const neighbour = newBoard[topIdx];
    if (neighbour.card && neighbour.owner && neighbour.owner !== owner) {
      const neighbourBottom = neighbour.card.sides[2];
      if (t > neighbourBottom) neighbour.owner = owner;
    }
  }
  // bottom
  if (pos < 6) {
    const bottomIdx = pos + 3;
    const neighbour = newBoard[bottomIdx];
    if (neighbour.card && neighbour.owner && neighbour.owner !== owner) {
      const neighbourTop = neighbour.card.sides[0];
      if (b > neighbourTop) neighbour.owner = owner;
    }
  }
  return newBoard;
}

export default function TripleTriadLite() {
  const [board, setBoard] = useState<BoardSlot[]>(() => createEmptyBoard());
  const [playerDeck, setPlayerDeck] = useState<Card[]>(() => [...SAMPLE_DECK_A]);
  const [aiDeck, setAIDeck] = useState<Card[]>(() => [...SAMPLE_DECK_B]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const scores = board.reduce(
    (acc, slot) => {
      if (slot.owner === 'A') acc.a++;
      else if (slot.owner === 'B') acc.b++;
      return acc;
    },
    { a: 0, b: 0 }
  );

  const handleSelectCard = (cardId: string) => {
    if (gameOver) return;
    setSelectedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const handlePlaceCard = (index: number) => {
    if (gameOver) return;
    const cardIndex = playerDeck.findIndex((c) => c.id === selectedCardId);
    if (selectedCardId && cardIndex !== -1 && !board[index].card) {
      const card = playerDeck[cardIndex];
      const newBoard = applyMove(board, index, card);
      const newPlayerDeck = playerDeck.filter((c) => c.id !== card.id);
      setBoard(newBoard);
      setPlayerDeck(newPlayerDeck);
      setSelectedCardId(null);
      if (newBoard.every((slot) => slot.card !== null)) {
        setGameOver(true);
        return;
      }
      setTimeout(() => {
        aiMove(newBoard, newPlayerDeck, aiDeck);
      }, 250);
    }
  };

  const aiMove = (
    currentBoard: BoardSlot[],
    updatedPlayerDeck: Card[],
    currentAIDeck: Card[]
  ) => {
    if (currentAIDeck.length === 0) {
      setBoard(currentBoard);
      setAIDeck(currentAIDeck);
      setGameOver(true);
      return;
    }
    let selected = currentAIDeck[0];
    let maxSum = selected.sides.reduce((a, b) => a + b, 0);
    for (const c of currentAIDeck) {
      const sum = c.sides.reduce((a, b) => a + b, 0);
      if (sum > maxSum) {
        selected = c;
        maxSum = sum;
      }
    }
    const emptyIndices = currentBoard
      .map((slot, idx) => (slot.card ? -1 : idx))
      .filter((idx) => idx !== -1);
    if (emptyIndices.length === 0) {
      setBoard(currentBoard);
      setAIDeck(currentAIDeck.filter((c) => c.id !== selected.id));
      setGameOver(true);
      return;
    }
    const targetIndex = emptyIndices[0];
    const newBoard = applyMove(currentBoard, targetIndex, selected);
    const newAIDeck = currentAIDeck.filter((c) => c.id !== selected.id);
    setBoard(newBoard);
    setAIDeck(newAIDeck);
    if (newBoard.every((slot) => slot.card !== null)) {
      setGameOver(true);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 text-gray-900">
      <h2 className="text-xl font-bold mb-2 text-center">Triple Triad Lite</h2>
      <div className="flex justify-between mb-2 text-sm">
        <div>Player: {scores.a}</div>
        <div>AI: {scores.b}</div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {board.map((slot, idx) => (
          <div
            key={idx}
            onClick={() => handlePlaceCard(idx)}
            className="relative h-24 border rounded-md flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            {slot.card ? (
              <div className="text-center">
                <div className="font-semibold text-xs">{slot.card.name}</div>
                <div className="grid grid-cols-3 gap-0 text-xs">
                  <div className="col-span-3">{slot.card.sides[0]}</div>
                  <div>{slot.card.sides[3]}</div>
                  <div>{slot.card.sides[1]}</div>
                  <div className="col-span-3">{slot.card.sides[2]}</div>
                </div>
              </div>
            ) : (
              <span className="text-gray-300">+</span>
            )}
            {slot.owner && (
              <span
                className={`absolute top-1 right-1 text-xs font-bold ${
                  slot.owner === 'A' ? 'text-blue-600' : 'text-red-600'
                }`}
              >
                {slot.owner}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {playerDeck.map((card) => (
          <div
            key={card.id}
            onClick={() => handleSelectCard(card.id)}
            className={`border rounded-md p-2 text-center text-xs cursor-pointer w-20 ${
              selectedCardId === card.id ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="font-semibold">{card.name}</div>
            <div className="grid grid-cols-3 gap-0 text-xs">
              <div className="col-span-3">{card.sides[0]}</div>
              <div>{card.sides[3]}</div>
              <div>{card.sides[1]}</div>
              <div className="col-span-3">{card.sides[2]}</div>
            </div>
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-center">
          Game over! {scores.a > scores.b ? 'You win!' : scores.a < scores.b ? 'AI wins.' : 'It\'s a draw.'}
        </div>
      )}
    </div>
  );
}
