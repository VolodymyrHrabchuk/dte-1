"use client";

import Image from "next/image";
import Logo from "../../public/mainLogo.svg";
import { useRouter } from "next/navigation";
import { useState } from "react";

const DEFAULT_TEAM_ID = 1;


const formatUSPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 4) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const Dashboard = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { name?: string; email?: string; phone?: string } = {};

    if (!name.trim()) {
      errors.name = "Please enter your name";
    } else if (name.trim().length < 2) {
      errors.name = "The name must be at least 2 characters long.";
    }

    if (!emailInput.trim()) {
      errors.email = "Please enter your email";
    } else {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(emailInput)) {
        errors.email = "Invalid email format";
      }
    }

    if (!phoneNumberInput.trim()) {
      errors.phone = "Please enter your phone number";
    } else {
      const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
      if (!phoneRegex.test(phoneNumberInput)) {
        errors.phone = "Incorrect format. Use (###) ###-####.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Optionally store user data locally (no server call)
      const digits = phoneNumberInput.replace(/\D/g, "");
      const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;

      const payload = {
        email: emailInput,
        first_name: name,
        last_name: schoolName,
        phone_number: e164,
        team: DEFAULT_TEAM_ID,
      };

      // Save locally (optional)
      try {
        localStorage.setItem("userData", JSON.stringify(payload));
      } catch {
        // ignore localStorage errors
      }

      // Navigate to assessments screen
      router.push("/assessments");
    } catch (err: any) {
      // Fallback error handling (shouldn't normally happen here)
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        err?.detail ??
        (typeof err === "string" ? err : err?.message) ??
        "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Directly navigate to assessments
    router.push("/assessments");
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center text-white mt-30 pb-10">
      <Image width={192} height={48} src={Logo} alt="Logo" quality={100} />
      <h1 className="mt-18 mb-10 text-center text-[32px] font-bold">
        Hello! Let's get acquainted
      </h1>

      <form className="space-y-8" onSubmit={handleSignup}>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors({ ...fieldErrors, name: undefined });
              }
            }}
            className="w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* School Name */}
        <div>
          <label htmlFor="schoolName" className="block text-sm mb-2">
            School Name
          </label>
          <input
            id="schoolName"
            type="text"
            placeholder="Enter your school name"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors({ ...fieldErrors, email: undefined });
              }
            }}
            className="w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm mb-2">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="tel"
            placeholder="(123) 456-7890"
            value={phoneNumberInput}
            onChange={(e) => {
              const formatted = formatUSPhone(e.target.value);
              setPhoneNumberInput(formatted);
              if (fieldErrors.phone) {
                setFieldErrors({ ...fieldErrors, phone: undefined });
              }
            }}
            className="w-[480px] px-6 py-[17.5px] rounded-full bg-transparent border border-white text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
          {fieldErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.phone}</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-[480px] py-[17.5px] rounded-full bg-white text-black font-medium text-lg"
        >
          {loading ? "Continuing..." : "Continue"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSkip}
        className="mt-6 w-[480px] py-[17.5px] rounded-full bg-transparent border border-white text-white font-medium text-lg"
      >
        I already have an account
      </button>
    </div>
  );
};

export default Dashboard;
