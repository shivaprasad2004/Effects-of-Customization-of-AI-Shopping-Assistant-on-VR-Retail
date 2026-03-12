"""
Orchestrator: Runs all ML training pipelines in sequence.
Usage: python train_all.py --demo
"""
import argparse
import subprocess
import sys


def run_training(script, args_list):
    print(f"\n{'='*60}")
    print(f"Running: {script}")
    print(f"{'='*60}\n")
    result = subprocess.run([sys.executable, script] + args_list, capture_output=False)
    if result.returncode != 0:
        print(f"WARNING: {script} exited with code {result.returncode}")
    return result.returncode


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Run all ML training pipelines')
    parser.add_argument('--demo', action='store_true', help='Run in demo mode with synthetic data')
    args = parser.parse_args()

    extra_args = ['--demo'] if args.demo else []

    print("VR Retail ML Training Pipeline")
    print(f"Mode: {'DEMO (synthetic data)' if args.demo else 'PRODUCTION'}")

    # 1. Emotion Recognition
    run_training('emotion_training.py', extra_args)

    # 2. Recommendation Engine
    run_training('recommender_training.py', extra_args)

    print(f"\n{'='*60}")
    print("All training pipelines completed!")
    print(f"{'='*60}")
