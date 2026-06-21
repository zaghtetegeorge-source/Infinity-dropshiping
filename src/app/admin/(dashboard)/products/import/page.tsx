import Link from "next/link";
import { ProductImportForm } from "@/components/admin/ProductImportForm";

export default function ProductImportPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Import products from CSV</h1>
        <Link href="/admin/products" className="text-sm font-medium text-gray-500 hover:underline">
          ← Back to products
        </Link>
      </div>

      <div className="mb-6 rounded-xl border bg-white p-5 text-sm text-gray-600">
        <p className="mb-2">
          Use this to bulk-add products you sourced from AliExpress/Alibaba (or anywhere else). Export the
          product list from your supplier/scraper tool as a CSV with these columns, then upload it below:
        </p>
        <code className="block overflow-x-auto rounded bg-gray-50 p-2 text-xs">
          slug, titleEn, titleAr, descriptionEn, descriptionAr, price, compareAtPrice, stock, categoryName,
          imageUrl1, imageUrl2, imageUrl3, published, featured
        </code>
        <p className="mt-2">
          Only <strong>slug</strong>, <strong>titleEn</strong>, <strong>titleAr</strong> and{" "}
          <strong>price</strong> are required — leave the rest blank if you don&apos;t have them yet, then
          tweak each product&apos;s title/description afterwards from the products list.
        </p>
        <a href="/templates/products-template.csv" download className="mt-3 inline-block font-medium text-brand hover:underline">
          Download a template CSV
        </a>
      </div>

      <ProductImportForm />
    </div>
  );
}
