function shuffleArray<T = unknown>(array: T[]): T[] {
  for (let index1 = array.length - 1; index1 > 0; --index1) {
    const index2 = Math.floor(Math.random() * (index1 + 1));

    const temporary = array[index1]!;
    array[index1] = array[index2]!;
    array[index2] = temporary;
  }

  return array;
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/******************************************************************************************************/

export { randomNumber, shuffleArray };
