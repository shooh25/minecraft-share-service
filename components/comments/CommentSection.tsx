"use client";

import { useState } from "react";
import { createComment } from "@/app/actions/comments";
import LoginDialog from "@/components/auth/LoginDialog";
import CommentForm from "@/components/comments/CommentForm";
import CommentItem from "@/components/comments/CommentItem";
import type { BuildComment, SessionUser } from "@/types";

interface CommentSectionProps {
  // コメントを付ける作品
  postId: string;
  // 作品の投稿者ID
  authorId: string;
  // 表示するコメント
  comments: BuildComment[];
  // ログイン中のユーザー
  user: SessionUser | null;
}

// 返信フォームの対象
interface ReplyTarget {
  id: string;
  nickname: string;
  rootId: string;
}

// コメント入力欄とコメント一覧
export default function CommentSection({
  postId,
  authorId,
  comments,
  user,
}: CommentSectionProps) {
  const [body, setBody] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [pending, setPending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // 投稿に成功したら true。失敗しても入力内容は残す
  const submit = async (content: string, parentId: string | null) => {
    const trimmed = content.trim();
    if (!trimmed || pending) return false;

    setPending(true);
    try {
      return await createComment(postId, trimmed, parentId);
    } catch {
      return false;
    } finally {
      setPending(false);
    }
  };

  const handleSubmit = async () => {
    // 未ログイン時は送信せず、ログインダイアログを開く
    if (!user) {
      setLoginOpen(true);
      return;
    }

    if (!(await submit(body, null))) return;
    setBody("");
  };

  const handleReplySubmit = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!replyTarget) return;

    if (!(await submit(replyBody, replyTarget.id))) return;
    setReplyBody("");
    setReplyTarget(null);
  };

  const toggleReply = (target: ReplyTarget) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    setReplyBody("");
    setReplyTarget((current) => (current?.id === target.id ? null : target));
  };

  const renderReplyForm = (target: ReplyTarget) => {
    if (replyTarget?.id !== target.id) return null;

    return (
      <div className="pt-2">
        <CommentForm
          compact
          user={user}
          value={replyBody}
          onChange={setReplyBody}
          onSubmit={handleReplySubmit}
          pending={pending}
          placeholder={`${target.nickname}さんに返信`}
        />
      </div>
    );
  };

  return (
    <section className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-zinc-900">コメント</h2>

      <div className="mt-4">
        <CommentForm
          user={user}
          value={body}
          onChange={setBody}
          onSubmit={handleSubmit}
          pending={pending}
          placeholder="コメントする"
        />
      </div>

      {comments.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">
          コメントはまだありません
        </p>
      ) : (
        <ul className="mt-2">
          {comments.map((thread) => {
            const target: ReplyTarget = {
              id: thread.id,
              nickname: thread.author.nickname,
              rootId: thread.id,
            };

            return (
              <li
                key={thread.id}
                className="border-b border-zinc-100 py-4 last:border-b-0"
              >
                <CommentItem
                  comment={thread}
                  isPostAuthor={thread.author.id === authorId}
                  onReply={() => toggleReply(target)}
                  replyOpen={replyTarget?.id === target.id}
                  replyForm={renderReplyForm(target)}
                />

                {thread.replies.length > 0 && (
                  <div className="mt-3 ml-11 space-y-4 pl-3 sm:ml-14 sm:pl-4">
                    {thread.replies.map((reply) => {
                      const replyTargetItem: ReplyTarget = {
                        id: reply.id,
                        nickname: reply.author.nickname,
                        rootId: thread.id,
                      };

                      return (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          isPostAuthor={reply.author.id === authorId}
                          onReply={() => toggleReply(replyTargetItem)}
                          replyOpen={replyTarget?.id === reply.id}
                          replyForm={renderReplyForm(replyTargetItem)}
                        />
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <LoginDialog
        open={loginOpen}
        error={false}
        onClose={() => setLoginOpen(false)}
      />
    </section>
  );
}
