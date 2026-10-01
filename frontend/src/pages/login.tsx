

"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { login } from "../store/adminSlice";
import Input from "../extra/Input";
import Image from "next/image";
import { useAppDispatch } from "@/store/store";
import Button from "../extra/Button";
import { projectName } from "@/util/config";
import { useRouter } from "next/router";
import { IconEye, IconEyeOff, IconCopy } from "@tabler/icons-react";

interface RootState {
  admin: {
    isAuth: boolean;
    admin: any;
  };
}

export default function Login() {
  const dispatch = useAppDispatch();
  const { isAuth, admin } = useSelector((state: RootState) => state.admin);
  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      router.push("/dashboard");
    }
  }, [isAuth, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoLogin, setDemoLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState({
    email: "",
    password: "",
  });



  const handleredirecttoForgotPassword = () => {
    router.push("/forgotPassword");
  };

  const handleSubmit = async (e?: React.FormEvent, directEmail?: string, directPassword?: string) => {
    e?.preventDefault();

    if (loading) return; // 🚫 prevent multiple clicks

    const finalEmail = directEmail || email;
    const finalPassword = directPassword || password;

    if (!finalEmail || !finalPassword) {
      let errorObj: any = {};
      if (!finalEmail) errorObj.email = "Email Is Required !";
      if (!finalPassword) errorObj.password = "Password is required !";
      return setError(errorObj);
    }

    try {
      setLoading(true); // disable button

      const trimedEmail = finalEmail.trim();
      const trimedPassword = finalPassword.trim();

      const payload: any = { email: trimedEmail, password: trimedPassword };
      const response: any = await dispatch(login(payload)).unwrap();

      // ✅ If API returns status false → enable button again
      if (response?.status === false) {
        setLoading(false);
      }

      // ✅ If success → slice will redirect
      // so do NOT enable button again

    } catch (err) {
      // ❌ If rejected
      setLoading(false);
      console.error("Login failed:", err);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem("isAuth") === "true";

    if (isAuth) {
      router.push("/dashboard");
    }
  }, []);
  const [type, setType] = useState("password");
  const hideShow = () => {
    type === "password" ? setType("text") : setType("password");
  };

  return (
    <>
      <div className="login-page-wrapper d-flex " style={{ height: "100vh" }}>
        <div className=" d-md-block d-none  w-100">
          <img
            src="/images/loginimage2.png"
            alt="Login"
            className=" w-100 h-100"
          />
        </div>
        <div className=" w-100">
          <div className="align-items-center d-flex h-100 justify-content-center w-100">
            <div className="w-50 w-md-100">
              <div>
                <img
                  src="/images/noImage.png"
                  alt="Logo"
                  className="mb-2"
                  height={75}
                  width={75}
                />
              </div>
              <h2 className="fw-semibold">Login to your account</h2>
              <p className="text-secondary">
                Let's connect, chat, and spark real connections. Enter your
                credentials to continue your journey on {projectName}.
              </p>
              <form>
                <Input
                  label={`Email`}
                  id={`loginEmail`}
                  placeholder={"Enter Email"}
                  type={`email`}
                  value={email}
                  name={"email"}
                  errorMessage={error.email && error.email}
                  onChange={(e: any) => {
                    setEmail(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        email: `Email Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        email: "",
                      });
                    }
                  }}
                  autoComplete="name"
                  onKeyPress={handleKeyPress}
                />
                <div className="custom-input">
                  <label>Password</label>
                  <div className="input-group">
                    <input
                      type={type}
                      value={password}
                      name="password"
                      id="password"
                      className="form-control border border-end-0 password-input"
                      placeholder="Enter Password"
                      onChange={(e: any) => {
                        setPassword(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            password: `Password Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            password: "",
                          });
                        }
                      }}
                      autoComplete="password"
                      onKeyPress={handleKeyPress}
                    />
                    <span
                      className="input-group-text border border-start-0 bg-white"
                      id="basic-addon2"
                    >
                      {type === "password" ? (
                        <IconEyeOff
                          onClick={hideShow}
                          className="text-secondary icon-class cursor-pointer"
                        />
                      ) : (
                        <IconEye
                          onClick={hideShow}
                          className="text-secondary icon-class cursor-pointer"
                        />
                      )}
                    </span>
                  </div>
                  <p className="errorMessage">
                    {error.password && error.password}
                  </p>
                </div>
              </form>

              <div className="w-100">
                <h4
                  className="cursor-pointer fs-6 text-end text-secondary"
                  style={{ fontWeight: 500, fontSize: "small" }}
                  onClick={handleredirecttoForgotPassword}
                >
                  Forgot Password ?
                </h4>
              </div>
              <div className="d-flex flex-wrap justify-content-center w-100 gap-3 mt-4">
                <Button
                  btnName={"Login"}
                  newClass={"login-btn  login py-2 fw-medium w-100"}
                  onClick={(e: React.FormEvent) => handleSubmit(e)}
                  style={{
                    backgroundColor: "#A855F7",
                    color: "white",
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                    borderRadius: "8px"
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
