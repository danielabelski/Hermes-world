#!/usr/bin/env python3
import importlib.util
import pathlib
import unittest


MODULE_PATH = pathlib.Path(__file__).with_name("hermes-gateway-world-adapter.py")
SPEC = importlib.util.spec_from_file_location("gateway_adapter", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SafeTaskTitleTests(unittest.TestCase):
    def test_preserves_a_short_polish_operation_name(self):
        self.assertEqual(
            MODULE.safe_task_title("Sprawdź temperaturę i stan workerów"),
            "Sprawdź temperaturę i stan workerów",
        )

    def test_uses_only_the_first_non_empty_line_and_bounds_it(self):
        title = MODULE.safe_task_title("\n  Uruchom kontrolę systemu\npełna prywatna treść", limit=18)
        self.assertEqual(title, "Uruchom kontrolę…")

    def test_redacts_addresses_emails_and_long_identifiers(self):
        title = MODULE.safe_task_title(
            "Wyślij wynik na user@example.com przez https://example.test/private?token=x "
            "abcdefghijklmnopqrstuvwxyz123456"
        )
        self.assertNotIn("user@example.com", title)
        self.assertNotIn("https://", title)
        self.assertNotIn("abcdefghijklmnopqrstuvwxyz123456", title)

    def test_replaces_secret_bearing_commands_instead_of_copying_them(self):
        self.assertEqual(
            MODULE.safe_task_title("API_KEY=super-secret wykonaj zadanie"),
            "Polecenie zawierające dane chronione",
        )


if __name__ == "__main__":
    unittest.main()
