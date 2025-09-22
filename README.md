# Travel Memories Map

旅人・恋人のための思い出地図アプリ「Travel Memories Map」の基盤コードです。Next.js 15 (App Router) と Supabase、MapLibre GL JS を使った地図体験をベースに、旅の思い出をピンと写真で残せる設計になっています。

## 主な技術スタック

- [Next.js 15 (App Router)](https://nextjs.org/) + React 18 + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [MapLibre GL JS](https://maplibre.org/projects/maplibre-gl-js/) + [MapTiler](https://www.maptiler.com/)
- [Supabase](https://supabase.com/) (Auth / Database / Storage)
- Supabase Storage での写真アップロード雛形
- GitHub Actions での lint / test / Vercel デプロイパイプライン

## セットアップ

### 必要要件

- Node.js 20 以上
- pnpm 8 以上 (リポジトリには `packageManager`: `pnpm@10.5.2` を指定)
- Supabase CLI (ローカル開発で DB・Storage を動かす場合)

### 初回セットアップ

1. 依存関係のインストール

   ```bash
   pnpm install
   ```

2. 環境変数の設定

   `.env.local` を作成し、以下の値を設定します。

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-api-key
   ```

   例として `.env.local.example` を用意しています。

3. Supabase のローカル環境を起動（任意）

   ```bash
   supabase start
   supabase db reset
   ```

   `supabase/migrations/0001_init.sql` にテーブル・RLS・Storage ポリシーを定義しています。

4. 開発サーバーの起動

   ```bash
   pnpm dev
   ```

   <http://localhost:3000> でアプリを確認できます。

### スクリプト一覧

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | Next.js 開発サーバーを起動します |
| `pnpm build` | 本番ビルドを実行します |
| `pnpm start` | 本番ビルド後のサーバーを起動します |
| `pnpm lint` | `next lint` を実行します |
| `pnpm test` | Vitest によるユニットテストを実行します |
| `pnpm typecheck` | TypeScript 型チェックを実行します |

## アプリ構成

- `src/app` — App Router。`/(app)` に認証済み画面（マップ・場所詳細・タイムライン）、`/(auth)` にログイン画面を配置。
- `src/components` — UI コンポーネント・フォーム・Map 表示など。
- `src/lib` — Supabase クライアント、クエリ、ユーティリティ。
- `src/types/database.ts` — Supabase の型定義。
- `supabase/migrations/0001_init.sql` — テーブル定義と RLS、Storage ポリシー。
- `.github/workflows/ci.yml` — Lint / Test / Vercel デプロイの GitHub Actions ワークフロー。

## Supabase スキーマ概要

| テーブル | 説明 |
| --- | --- |
| `spaces` | ソロ / ペアのスペース情報。`owner_id` は Auth ユーザー ID |
| `space_members` | スペース参加ユーザーと権限 |
| `places` | 地図上の場所ピン |
| `memories` | 場所に紐づく思い出（メモ / 訪問日） |
| `photos` | 思い出に紐づく写真メタデータ |

- Storage バケット `memories` を作成し、`space_id/place_id/memory_id/uuid.jpg` の構造で保存。
- 各テーブルと Storage は「スペースメンバーのみがアクセスできる」RLS / ポリシーを設定しています。

## GitHub Actions

`.github/workflows/ci.yml` で以下を実行します。

1. `pnpm install` で依存関係をインストール
2. `pnpm lint` と `pnpm test` を実行
3. main ブランチへの push 時に Vercel デプロイ (環境変数 `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` が必要)

## 開発メモ

- MapLibre GL JS + MapTiler で地図を表示し、Supercluster によるピンのクラスタリングを行います。
- `PlaceForm` / `MemoryForm` コンポーネントはピン登録・写真アップロードの雛形です。Storage へのアップロード後に `photos` テーブルへメタデータを登録します。
- `SpaceProvider` と `SpaceSwitcher` でスペースを切り替え、サーバーアクションを用いて Cookie に選択状態を保持します。
- テストは Vitest + Testing Library を利用し、ページのレンダリングと Supabase クライアント生成の最小検証を行います。

## ライセンス

MIT License
