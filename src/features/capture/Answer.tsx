"use client";

/**
 * The screen answer, at the top, in one sentence.
 *
 * Not a band of figures: a sentence with a subject and a verb, because whoever
 * opens this at noon on a Friday wants to know whether the week is going to
 * close, not four cards to deduce it from.
 */

const styles = {
  block: "flex flex-col gap-1",
  sentence: "text-xl font-semibold leading-snug sm:text-2xl",
  support: "text-sm text-muted-foreground",
};

interface AnswerProps {
  sentence: string;
  support?: string;
}

export function Answer({ sentence, support }: AnswerProps) {
  return (
    <div className={styles.block}>
      <h1 className={styles.sentence}>{sentence}</h1>
      {support ? <p className={styles.support}>{support}</p> : null}
    </div>
  );
}
