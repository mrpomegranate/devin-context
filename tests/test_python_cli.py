import io
import os
import sys
import unittest
from pathlib import Path

# Ensure src is on sys.path for local test discovery
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from devin_context import __version__
from devin_context.cli import get_cli_script_path, main


class TestPythonCLI(unittest.TestCase):
    def test_version(self):
        self.assertEqual(__version__, "0.1.0")

    def test_get_cli_script_path(self):
        script_path = get_cli_script_path()
        self.assertTrue(script_path.is_file(), f"Path does not exist: {script_path}")
        self.assertTrue(script_path.name.endswith("devin-context.js"))

    def test_main_help(self):
        ret = main(["help"])
        self.assertEqual(ret, 0)

    def test_main_spec_detect(self):
        ret = main(["spec", "detect"])
        self.assertEqual(ret, 0)


if __name__ == "__main__":
    unittest.main()
