import { notFound } from 'next/navigation';
import { getArticleById, getAllArticles } from '@/lib/data';
import ArticleDetail from '@/components/ArticleDetail';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map(a => ({ id: a.article_id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) return { title: 'Artículo no encontrado' };
  return {
    title: `${article.title} — Ley Miscelánea`,
    description: article.llm_analysis?.plain_explanation,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();
  return <ArticleDetail article={article} />;
}
