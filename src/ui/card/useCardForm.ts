import { useState, useEffect, useMemo, useRef } from 'react';
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
  
  // 前回のcard.idとupdatedAtを保持して、変更時のみ更新
  const prevCardIdRef = useRef<string | undefined>(card?.id);
  const prevUpdatedAtRef = useRef<number | undefined>(card?.updatedAt);

  // カードが変更されたときにフォームをリセット
  useEffect(() => {
    const currentCardId = card?.id;
    const currentUpdatedAt = card?.updatedAt;
    
    // card.idまたはupdatedAtが変更された場合のみ更新
    if (
      prevCardIdRef.current !== currentCardId ||
      prevUpdatedAtRef.current !== currentUpdatedAt
    ) {
      prevCardIdRef.current = currentCardId;
      prevUpdatedAtRef.current = currentUpdatedAt;
      
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id, card?.updatedAt]);

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
