import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../domain/schema';

type UseCardFormOptions = {
  initialTitle?: string;
  initialBody?: string;
  initialLabelIds?: string[];
  card?: Card;
};

export const useCardForm = ({
  initialTitle = '',
  initialBody = '',
  initialLabelIds = [],
  card,
}: UseCardFormOptions = {}) => {
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [labelIds, setLabelIds] = useState<string[]>(initialLabelIds);
  const [titleError, setTitleError] = useState(false);

  // カードが変更されたときにフォームをリセット
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setBody(card.body);
      setLabelIds(card.labelIds);
    } else {
      setTitle(initialTitle);
      setBody(initialBody);
      setLabelIds(initialLabelIds);
    }
    setTitleError(false);
  }, [card, initialTitle, initialBody, initialLabelIds]);

  // 編集差分検知（dirty 判定）
  const isDirty = useMemo(() => {
    if (!card) return false;
    return (
      title !== card.title ||
      body !== card.body ||
      !arraysEqual(labelIds, card.labelIds)
    );
  }, [title, body, labelIds, card]);

  const reset = () => {
    if (card) {
      setTitle(card.title);
      setBody(card.body);
      setLabelIds(card.labelIds);
    } else {
      setTitle(initialTitle);
      setBody(initialBody);
      setLabelIds(initialLabelIds);
    }
    setTitleError(false);
  };

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError(true);
      return false;
    }
    setTitleError(false);
    return true;
  };

  return {
    title,
    setTitle,
    body,
    setBody,
    labelIds,
    setLabelIds,
    titleError,
    setTitleError,
    isDirty,
    reset,
    validate,
  };
};

// 配列の等価性チェック（JSON.stringifyの代わり）
function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}
