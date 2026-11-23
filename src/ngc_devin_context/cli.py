import os
import sys
import subprocess
from pathlib import Path


def get_ndc_script_path() -> Path:
    pkg_dir = Path(__file__).resolve().parent
    bundled = pkg_dir / "_js" / "bin" / "ndc.js"
    if bundled.is_file():
        return bundled
    repo_bin = pkg_dir.parent.parent / "bin" / "ndc.js"
    if repo_bin.is_file():
        return repo_bin
    raise FileNotFoundError(
        f"Could not locate ndc.js runtime entrypoint. Looked in {bundled} and {repo_bin}"
    )


def main(args=None) -> int:
    if args is None:
        args = sys.argv[1:]

    try:
        script_path = get_ndc_script_path()
    except FileNotFoundError as err:
        sys.stderr.write(f"ndc: {err}\n")
        return 1

    try:
        result = subprocess.run(
            ["node", str(script_path), *args],
            check=False,
        )
        return result.returncode
    except FileNotFoundError:
        sys.stderr.write(
            "ndc: Error: 'node' executable not found in PATH.\n"
            "Node.js (>=20) is required to run NGC Devin Context CLI.\n"
            "Please ensure Node.js is installed and available in your environment.\n"
        )
        return 1
    except KeyboardInterrupt:
        return 130
    except Exception as err:
        sys.stderr.write(f"ndc: {err}\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
