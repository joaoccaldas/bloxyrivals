import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")

class EntryPointTests(unittest.TestCase):
    def test_single_doctype(self):
        self.assertEqual(1, len(re.findall(r'<!doctype html>', INDEX, flags=re.I)))

    def test_local_script_sources_exist(self):
        sources = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', INDEX, flags=re.I)
        missing = []
        for src in sources:
            if re.match(r'^(https?:)?//', src):
                continue
            clean = src.split("?", 1)[0].split("#", 1)[0].removeprefix("./")
            candidate = (ROOT / clean).resolve()
            try:
                candidate.relative_to(ROOT.resolve())
            except ValueError:
                missing.append(src)
                continue
            if not candidate.exists():
                missing.append(src)
        self.assertEqual([], missing, f"Missing/escaping script sources: {missing}")

    def test_global_click_debug_hook_is_not_shipped(self):
        self.assertNotIn("Global click detected on:", INDEX)

if __name__ == "__main__":
    unittest.main()
