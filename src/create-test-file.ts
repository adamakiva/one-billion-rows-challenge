import type { Buffer } from 'node:buffer';
import { createReadStream, createWriteStream } from 'node:fs';
import { join } from 'node:path';
import { Readable, Writable, type ReadableOptions, type WritableOptions } from 'node:stream';
import { styleText } from 'node:util';

import { randomNumber, shuffleArray } from './utilities.ts';

/******************************************************************************************************/

const CITIES_AMOUNT = 10_000;
const NUMBER_OF_ROWS = 1_000_000_000;
const ONE_PERCENT = NUMBER_OF_ROWS / 100;
const TEXT_ENCODING = 'utf8';

/******************************************************************************************************/

class RowGeneratorStream extends Readable {
  readonly #cityNames;

  #currentPercentage;
  #currentRow;

  public constructor(cityNames: string[], options?: ReadableOptions) {
    super(options);

    this.#cityNames = cityNames;

    this.#currentRow = 0;
    this.#currentPercentage = 0;
  }

  public override _read(): void {
    if (this.#currentRow > NUMBER_OF_ROWS) {
      console.info(styleText('green', 'Done'));
      this.push(null);
      return;
    }
    ++this.#currentRow;
    this.push(this.#buildRow());

    if (this.#currentRow % ONE_PERCENT === 0) {
      ++this.#currentPercentage;
      console.info(styleText('green', `Completed ${this.#currentPercentage}%`));
    }
  }

  /****************************************************************************************************/

  #buildRow(): string {
    return `${this.#cityNames[randomNumber(0, this.#cityNames.length)]};${randomNumber(300, 799) / 10}\n`;
  }
}

/******************************************************************************************************/

class ProcessorStream extends Writable {
  readonly #cityNames;

  public constructor(options?: WritableOptions) {
    super(options);

    this.#cityNames = new Set<string>();
  }

  public override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const utf8Chunk = chunk.toString(TEXT_ENCODING);

    utf8Chunk.split('\n').forEach((cityName) => {
      this.#cityNames.add(cityName);
    });

    callback(null);
  }

  public override _final(callback: (error?: Error | null) => void): void {
    const readable = new RowGeneratorStream(
      shuffleArray([...this.#cityNames]).slice(0, CITIES_AMOUNT),
    )
      .once('end', () => {
        callback();
      })
      .on('error', callback);
    const writable = createWriteStream('test-file').on('error', callback);

    readable.pipe(writable);
  }
}

/******************************************************************************************************/

function main(): void {
  const readable = createReadStream(join(import.meta.dirname, '..', 'assets', 'list-of-cities'), {
    encoding: TEXT_ENCODING,
  });
  const writable = new ProcessorStream().on('error', console.error);

  readable.pipe(writable);
}

/******************************************************************************************************/

main();
