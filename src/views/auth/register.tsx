"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import axiosInstance from "@/utils/axios";
import Swal from "sweetalert2";
import ErrorHandler from "@/utils/error-handler";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterForm() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);

    const handleRegister = async (values: any) => {
        try {
            const { data } = await axiosInstance.post("/register", values);
            Swal.fire({
              icon: "success",
              title: 'Succesfully Register',
              showConfirmButton: false,
              timer: 2000,
            }).then(() => router.push("/login"));
        } catch (err) {
            ErrorHandler(err);
        }
    }

    const formik = useFormik({
        initialValues: {
            fullname: '',
            email: '',
            password: '',

        },
        validationSchema: Yup.object({
            fullname: Yup.string()
                .required("Required"),
            email: Yup.string()
                .email("Invalid email address")
                .required("Required"),
            password: Yup.string()
                .min(6, "Password must be at least 6 characters")
                .required("Required"),
        }),
        onSubmit: (values) => {
            handleRegister(values)
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullname" className="block text-sm font-medium text-gray-600">
                            Fullname
                        </label>
                        <input
                            type="text"
                            id="fullname"
                            {...formik.getFieldProps('fullname')}
                            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formik.touched.fullname && formik.errors.fullname ? (
                            <p className="text-sm text-red-600">{formik.errors.fullname}</p>
                        ) : null}
                    </div>
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
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}
