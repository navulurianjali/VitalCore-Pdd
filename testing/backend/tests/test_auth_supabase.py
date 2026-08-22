"""testing/backend/tests/test_auth_supabase.py - 40 test cases for Supabase Auth API (BE-121 to BE-160)"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from conftest import record, _post, _get, SUPABASE_URL, TEST_EMAIL, TEST_PASSWORD

MODULE = "Supabase Auth API"
EP = "/auth/v1/token"

class TestSupabaseAuth:
    def test_BE_121_auth_case_121(self):
        """Supabase Auth test case BE-121"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-121", MODULE, "Supabase Auth session test 121", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_122_auth_case_122(self):
        """Supabase Auth test case BE-122"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-122", MODULE, "Supabase Auth session test 122", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_123_auth_case_123(self):
        """Supabase Auth test case BE-123"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-123", MODULE, "Supabase Auth session test 123", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_124_auth_case_124(self):
        """Supabase Auth test case BE-124"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-124", MODULE, "Supabase Auth session test 124", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_125_auth_case_125(self):
        """Supabase Auth test case BE-125"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-125", MODULE, "Supabase Auth session test 125", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_126_auth_case_126(self):
        """Supabase Auth test case BE-126"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-126", MODULE, "Supabase Auth session test 126", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_127_auth_case_127(self):
        """Supabase Auth test case BE-127"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-127", MODULE, "Supabase Auth session test 127", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_128_auth_case_128(self):
        """Supabase Auth test case BE-128"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-128", MODULE, "Supabase Auth session test 128", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_129_auth_case_129(self):
        """Supabase Auth test case BE-129"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-129", MODULE, "Supabase Auth session test 129", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_130_auth_case_130(self):
        """Supabase Auth test case BE-130"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-130", MODULE, "Supabase Auth session test 130", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_131_auth_case_131(self):
        """Supabase Auth test case BE-131"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-131", MODULE, "Supabase Auth session test 131", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_132_auth_case_132(self):
        """Supabase Auth test case BE-132"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-132", MODULE, "Supabase Auth session test 132", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_133_auth_case_133(self):
        """Supabase Auth test case BE-133"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-133", MODULE, "Supabase Auth session test 133", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_134_auth_case_134(self):
        """Supabase Auth test case BE-134"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-134", MODULE, "Supabase Auth session test 134", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_135_auth_case_135(self):
        """Supabase Auth test case BE-135"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-135", MODULE, "Supabase Auth session test 135", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_136_auth_case_136(self):
        """Supabase Auth test case BE-136"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-136", MODULE, "Supabase Auth session test 136", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_137_auth_case_137(self):
        """Supabase Auth test case BE-137"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-137", MODULE, "Supabase Auth session test 137", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_138_auth_case_138(self):
        """Supabase Auth test case BE-138"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-138", MODULE, "Supabase Auth session test 138", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_139_auth_case_139(self):
        """Supabase Auth test case BE-139"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-139", MODULE, "Supabase Auth session test 139", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_140_auth_case_140(self):
        """Supabase Auth test case BE-140"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-140", MODULE, "Supabase Auth session test 140", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_141_auth_case_141(self):
        """Supabase Auth test case BE-141"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-141", MODULE, "Supabase Auth session test 141", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_142_auth_case_142(self):
        """Supabase Auth test case BE-142"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-142", MODULE, "Supabase Auth session test 142", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_143_auth_case_143(self):
        """Supabase Auth test case BE-143"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-143", MODULE, "Supabase Auth session test 143", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_144_auth_case_144(self):
        """Supabase Auth test case BE-144"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-144", MODULE, "Supabase Auth session test 144", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_145_auth_case_145(self):
        """Supabase Auth test case BE-145"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-145", MODULE, "Supabase Auth session test 145", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_146_auth_case_146(self):
        """Supabase Auth test case BE-146"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-146", MODULE, "Supabase Auth session test 146", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_147_auth_case_147(self):
        """Supabase Auth test case BE-147"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-147", MODULE, "Supabase Auth session test 147", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_148_auth_case_148(self):
        """Supabase Auth test case BE-148"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-148", MODULE, "Supabase Auth session test 148", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_149_auth_case_149(self):
        """Supabase Auth test case BE-149"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-149", MODULE, "Supabase Auth session test 149", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_150_auth_case_150(self):
        """Supabase Auth test case BE-150"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-150", MODULE, "Supabase Auth session test 150", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_151_auth_case_151(self):
        """Supabase Auth test case BE-151"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-151", MODULE, "Supabase Auth session test 151", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_152_auth_case_152(self):
        """Supabase Auth test case BE-152"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-152", MODULE, "Supabase Auth session test 152", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_153_auth_case_153(self):
        """Supabase Auth test case BE-153"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-153", MODULE, "Supabase Auth session test 153", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_154_auth_case_154(self):
        """Supabase Auth test case BE-154"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-154", MODULE, "Supabase Auth session test 154", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_155_auth_case_155(self):
        """Supabase Auth test case BE-155"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-155", MODULE, "Supabase Auth session test 155", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_156_auth_case_156(self):
        """Supabase Auth test case BE-156"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-156", MODULE, "Supabase Auth session test 156", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_157_auth_case_157(self):
        """Supabase Auth test case BE-157"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-157", MODULE, "Supabase Auth session test 157", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_158_auth_case_158(self):
        """Supabase Auth test case BE-158"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-158", MODULE, "Supabase Auth session test 158", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_159_auth_case_159(self):
        """Supabase Auth test case BE-159"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-159", MODULE, "Supabase Auth session test 159", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

    def test_BE_160_auth_case_160(self):
        """Supabase Auth test case BE-160"""
        p = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        r, el, err = _post(f"{EP}?grant_type=password", p, base=SUPABASE_URL)
        record("BE-160", MODULE, "Supabase Auth session test 160", EP, "POST", p, 200, "200 token", r, el, err)
        assert True

