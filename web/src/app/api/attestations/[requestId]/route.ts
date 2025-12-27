import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const INDEXER_URL = process.env.INDEXER_URL || process.env.NEXT_PUBLIC_INDEXER_URL || "http://localhost:4001";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ requestId: string }> }
) {
	try {
		const { requestId } = await params;
		const res = await fetch(`${INDEXER_URL}/attestations/${requestId}`, {
			cache: "no-store",
		});

		if (!res.ok) {
			if (res.status === 404) {
				return NextResponse.json({ error: "Attestation not found" }, { status: 404 });
			}
			return NextResponse.json(
				{ error: "Failed to fetch attestation from indexer" },
				{ status: res.status }
			);
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching attestation (indexer may be down):", error);
		return NextResponse.json(
			{ error: "Failed to fetch attestation" },
			{ status: 500 }
		);
	}
}

