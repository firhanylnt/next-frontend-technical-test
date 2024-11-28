"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import ErrorHandler from "@/utils/error-handler";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import useAuthStore, { IUser } from "@/stores/auth-store";
import axiosInstance from "@/utils/axios";
import { useEffect } from "react";
import Link from "next/link";

interface ILogin {
    email: string;
    password: string;
}

const HandleLogin = async (onAuthSuccess: (user: IUser | null) => void) => {
    try {
        const access_token = getCookie("access_token") || "";
        
        if (!access_token) {
            throw new Error("Access token not found.");
        }
        
        const user: IUser = jwtDecode(access_token as string);
        
        setCookie("access_token", access_token);
        
        onAuthSuccess(user);
    } catch (err) {
        deleteCookie("access_token");
        console.error("Error during login:", err);
        throw err;
    }
};

export default function LoginForm() {
    const { onAuthSuccess, user } = useAuthStore();
    const router = useRouter();

    const login = async (params: ILogin) => {
        try {
          const {data} = await axiosInstance.post("/login", params);
          setCookie("access_token", data.access_token)

          await HandleLogin(onAuthSuccess);
    
            Swal.fire({
                icon: "success",
                title: 'Login Success',
                showConfirmButton: false,
                timer: 2000,
            }).then(async () => {
                router.push("/admin");
            });
        } catch (err) {
          ErrorHandler(err);
        }
      };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Invalid email address")
                .required("Required"),
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Required"),
        }),
        onSubmit: (values) => {
            login(values)
        },
    });

    useEffect(() => {
        console.log(user);
    }, [user])

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...formik.getFieldProps('email')}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <p className="text-sm text-red-600">{formik.errors.email}</p>
                        ) : null}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            {...formik.getFieldProps('password')}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <p className="text-sm text-red-600">{formik.errors.password}</p>
                        ) : null}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Login
                    </button>
                    <div>
                        <span className="text-sm">Don't have an account? </span>
                        <Link className="text-sm underline" href='/register'>Register here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
