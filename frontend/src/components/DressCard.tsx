"use client";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { Dress } from "@/lib/api";
import { formatPrice, statusColor } from "@/lib/utils";

export default function DressCard({ dress }: { dress: Dress }) {
  return (
    <Link href={`/dresses/${dress.id}`} className="group block">
      <div className="glass-card overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {dress.imageUrl ? (
            <img
              src={dress.imageUrl}
              alt={dress.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-pink-100">
              <span className="text-4xl">👗</span>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Hover CTA */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="btn-primary text-xs">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`badge ${statusColor(dress.status)}`}>
              {dress.status}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-violet-600 transition-colors">
            {dress.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded-full bg-gray-100">
                {dress.size}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-gray-100">
                {dress.color}
              </span>
            </div>
            <span className="text-sm font-bold text-violet-600">
              {formatPrice(dress.pricePerDay)}
              <span className="text-xs font-normal text-gray-400">/day</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
