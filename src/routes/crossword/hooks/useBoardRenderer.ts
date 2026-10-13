import { useEffect, useLayoutEffect } from "react";

import { useCrosswordContext } from "../Components/CrosswordContext";

const rebusSizeMap: Record<number, number> = {
  2: 17,
  3: 13,
  4: 9,
  5: 8,
  6: 6,
  7: 5,
  8: 5,
  9: 5,
  10: 5
};

export function useBoardRenderer() {
  const {
    boardRef,
    body,
    data,
    selected,
    direction,
    boardState,
    autoCheck,
    complete,
    globalSelectedClue,
    setDirection,
    setSelected,
    getCellsInDirection,
    checkCell,
    setOverlayURL,
    readOnly
  } = useCrosswordContext();

  function forEachCell(callback: (cell: SVGElement, index: number) => void) {
    if (!boardRef.current) return;
    const cells = boardRef.current.querySelectorAll(".cell");
    for (const cell of cells) {
      const parent = cell.parentElement;
      if (!parent) continue;
      const index = parseInt(parent.getAttribute("data-index") || "-1", 10);
      if (isNaN(index) || index < 0) continue;
      callback(cell as SVGElement, index);
    }
  }

  useLayoutEffect(() => {
    // one-time setup
    forEachCell((cell) => {
      if (cell.getAttribute("fill") === "#d3d3d3") {
        cell.removeAttribute("fill");
        cell.classList.add("shaded");
      }

      if (cell.getAttribute("fill") === "none" || cell.classList.contains("shaded")) {
        cell.setAttribute("fill", "transparent");
      }
    });
  }, [data, boardRef]);

  function handleCellClick(e: PointerEvent) {
    const target = e.target as HTMLElement;
    let parent: SVGGElement | null = null;
    if (target.nodeName === "g") {
      parent = target as unknown as SVGGElement;
    }
    if (target.nodeName === "path" || target.nodeName === "text") {
      parent = target.parentElement as unknown as SVGGElement;
    }
    if (!parent) return;
    const index = parseInt(parent.getAttribute("data-index") ?? "-1", 10);
    if (isNaN(index) || index < 0) return;
    if (readOnly) return;
    if (selected === index) {
      setDirection(direction === "across" ? "down" : "across");
    }
    setSelected(index);
  }

  useEffect(() => {
    if (readOnly) return;
    forEachCell((cell, index) => {
      if (body.cells[index]?.answer === undefined) return;
      const parent = cell.parentElement;
      if (!parent) return;
      parent.addEventListener("click", handleCellClick);
    });

    return () => {
      forEachCell((cell) => {
        const parent = cell.parentElement;
        if (!parent) return;
        parent.removeEventListener("click", handleCellClick);
      });
    };
  }, [data, boardRef, selected, direction, readOnly]);

  useLayoutEffect(() => {
    // cell highlighting
    forEachCell((cell, index) => {
      if (selected !== null) {
        const highlightedCells = getCellsInDirection(selected, direction);
        cell.classList.toggle("highlighted", highlightedCells.includes(index));
        cell.classList.toggle("selected", selected === index);

        let isRelated = false;
        if (globalSelectedClue && globalSelectedClue.relatives) {
          globalSelectedClue.relatives.forEach((rel) => {
            const relClue = body.clues[rel];
            if (relClue.cells.includes(index)) {
              isRelated = true;
            }
          });
        }
        cell.classList.toggle("related", isRelated);
      }
    });
  }, [selected, direction]);

  useLayoutEffect(() => {
    // cell content
    forEachCell((cell, index) => {
      const parent = cell.parentElement;
      if (!parent) return;
      const guess: SVGTextElement | null = parent.querySelector(".guess");
      if (!guess) return;

      if (boardState[index]) {
        guess.innerHTML = boardState[index].toUpperCase();
      } else {
        guess.innerHTML = "";
      }

      if (autoCheck && guess) {
        const isCorrect = checkCell(index) && boardState[index] !== undefined;
        guess.classList.toggle("correct", isCorrect);
        guess.classList.toggle("incorrect", !isCorrect && boardState[index] !== undefined);
      } else if (!autoCheck) {
        guess.classList.remove("correct", "incorrect");
      }

      // rebus sizing
      const guessLength: number = boardState[index]?.length ?? 0;
      if (boardState[index] && guessLength > 1) {
        if (guess) {
          guess.setAttribute("font-size", rebusSizeMap[guessLength].toString() ?? "22");
        }
      } else if (guessLength === 1) {
        guess.setAttribute("font-size", "22");
      }
    });
  }, [boardState, autoCheck]);

  useLayoutEffect(() => {
    // overlays
    if (!boardRef.current) return;
    if (data.assets && data.assets.length > 0) {
      let startOverlay = null;
      let solveOverlay = null;
      data.assets.forEach((asset) => {
        if (asset.uri.endsWith(".start.png") || asset.uri.endsWith(".start.gif")) {
          startOverlay = asset.uri;
        }
        if (asset.uri.endsWith(".solve.png") || asset.uri.endsWith(".solve.gif")) {
          solveOverlay = asset.uri;
        }
      });
      if ((startOverlay && solveOverlay && !complete) || (startOverlay && !solveOverlay)) {
        setOverlayURL(startOverlay);
      }
      if (solveOverlay && complete) {
        setOverlayURL(solveOverlay);
      }
      if (!startOverlay && !solveOverlay) {
        setOverlayURL("");
      }
    }
  }, [boardRef, complete]);
}
