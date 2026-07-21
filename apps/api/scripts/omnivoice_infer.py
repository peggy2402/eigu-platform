#!/usr/bin/env python3
"""
OmniVoice Inference Script
===========================
Được gọi từ NestJS backend qua child_process.
Hỗ trợ Voice Cloning (giữ nguyên nội dung, đổi giọng).

Usage:
  python3 omnivoice_infer.py --input input.wav --output output.wav [--instruct "female, british accent"]
"""

import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser(description="OmniVoice Inference")
    parser.add_argument("--input", required=True, help="Path to input audio file")
    parser.add_argument("--output", required=True, help="Path to output audio file")
    parser.add_argument("--instruct", default="", help="Voice description (e.g. 'female, british accent')")
    args = parser.parse_args()

    try:
        from omnivoice import OmniVoice
        import soundfile as sf
        import torch
    except ImportError:
        print("Lỗi: Chưa cài omnivoice. Chạy: bash setup_omnivoice.sh")
        sys.exit(1)

    if not os.path.exists(args.input):
        print(f"Lỗi: Không tìm thấy file {args.input}")
        sys.exit(1)

    try:
        device = "cpu"  # MPS segfault với model này, dùng CPU cho ổn định
        model = OmniVoice.from_pretrained(
            "k2-fsa/OmniVoice",
            device_map=device,
            dtype=torch.float16 if device == "mps" else torch.float32,
        )

        if args.instruct:
            audio = model.generate(
                text="",
                ref_audio=args.input,
                instruct=args.instruct,
            )
        else:
            audio = model.generate(
                text="",
                ref_audio=args.input,
            )

        sf.write(args.output, audio[0], 24000)
        print(f"OK: {args.output}")

    except Exception as e:
        print(f"Lỗi: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
