"use client";

import { LogOut, Menu, User } from "lucide-react";
import { adminLogoutAction } from "@/app/admin/actions";

export function AdminTopbar() {
    return (
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-10">
            <div className="flex items-center">
                {/* Mobile menu button */}
                <button className="md:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-700">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-neutral-600" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-neutral-900 leading-none">Vijay Chawan</p>
                        <p className="text-xs text-neutral-500 mt-1">Administrator</p>
                    </div>
                </div>
                <div className="h-6 w-px bg-neutral-200 mx-2"></div>
                <form action={adminLogoutAction}>
                    <button
                        type="submit"
                        className="flex items-center text-sm font-medium text-neutral-600 hover:text-brand-red transition-colors"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </form>
            </div>
        </header>
    );
}
