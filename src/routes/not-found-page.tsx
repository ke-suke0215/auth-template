import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page">
      <section className="card" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">ページが見つかりません</h1>
        <p>指定されたページは存在しません。</p>
        <Link to="/">ホームへ戻る</Link>
      </section>
    </main>
  );
}
