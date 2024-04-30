"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, 
    DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CircleUserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import styles from './userdropdown.module.css';


export default function UserDropdown({ isAuthenticated, collapsed }) {

    return (
        <>
            {
                isAuthenticated === '' ? <></> :
                (
                    isAuthenticated === 'false' ?
                    <Link href="https://product-traceability-poc.vercel.app/login" rel="noreferrer" passHref>
                        <Button>
                            Login
                        </Button>
                    </Link> :
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <CircleUserRound className={styles['user-icon']} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={`${styles['dropdown-content-compact']} ${collapsed && styles['dropdown-content-expanded']}`}>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Link href="https://product-traceability-poc.vercel.app/logout" rel="noreferrer" passHref>
                                <DropdownMenuItem >
                                    Logout
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        </>
    )
}