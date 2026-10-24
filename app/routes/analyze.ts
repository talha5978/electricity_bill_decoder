import { data } from "react-router";
import type { Route } from "./+types/analyze";
import { BillReaderError, readBillImage } from "../services/bill-reader.server";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return data({ ok: false as const, message: "Use the photo confirmation button to start reading." }, { status: 405 });
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 9 * 1024 * 1024) {
    return data({ ok: false as const, message: "This photo is larger than 8 MB. Choose a smaller image." }, { status: 413 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return data({ ok: false as const, message: "The photo upload was interrupted. Please retry." }, { status: 400 });
  }
  const image = formData.get("billImage");
  if (!(image instanceof File)) {
    return data({ ok: false as const, message: "Choose a photo before asking us to read the bill." }, { status: 400 });
  }

  try {
    const bill = await readBillImage(image);
    return data({ ok: true as const, bill });
  } catch (error) {
    const failure = error instanceof BillReaderError
      ? error
      : new BillReaderError("We couldn’t read this bill. Check the photo and retry.");
    return data({ ok: false as const, message: failure.message }, { status: failure.status });
  }
}
