// src/pages/LoginPage.tsx

import { useEffect } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Correctly import Form components
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'; // Make sure path is correct
import { useAuth } from '@/contexts/auth-context'; // Correct path
import { useLogin } from '@/hooks/useAuth';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';

// Schema and Type definitions (keep as before)
const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
});
type LoginFormValues = z.infer<typeof loginSchema>;
interface LoginSearch { redirect?: string; }

export function LoginPage() {
    const navigate = useNavigate();
    const { login: updateAuthContext, isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const loginMutation = useLogin();
    const search: LoginSearch = useSearch({ from: '/login' });
    const redirectUrl = search.redirect || '/';

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onChange',
    });

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            navigate({ to: redirectUrl, replace: true });
        }
    }, [isAuthenticated, isAuthLoading, navigate, redirectUrl]);

    const onSubmit = async (values: LoginFormValues) => {
        loginMutation.mutate(values, {
            onSuccess: (data) => {
                updateAuthContext(data.token, data.user);
                toast.success("Login successful! Redirecting...");
                navigate({ to: redirectUrl, replace: true });
            },
            onError: (error: unknown) => {
                let errorMessage = "Login failed. Please check credentials or server status.";
                if (isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message || errorMessage;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error("LoginPage: Login mutation failed:", error);
                toast.error(errorMessage);
                form.setError("root.serverError", { message: errorMessage });
            }
        });
    };

    if (isAuthLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    if (isAuthenticated) return null;

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-sm shadow-lg border-border/40">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle> {/* Fixed typo */}
                    <CardDescription>Enter your credentials to sign in</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor={field.name}>Email Address</FormLabel> {/* Use field.name for htmlFor */}
                                        {/* --- CHECK HERE --- */}
                                        <FormControl>
                                            {/* This <Input> should be the *only* direct child */}
                                            <Input
                                                id={field.name} // Use field.name for id
                                                type="email"
                                                placeholder="you@example.com"
                                                autoComplete="email"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        {/* --- END CHECK --- */}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor={field.name}>Password</Label> {/* Use Label directly or FormLabel */}
                                        {/* --- CHECK HERE --- */}
                                        <FormControl>
                                            {/* This <Input> should be the *only* direct child */}
                                            <Input
                                                id={field.name} // Use field.name for id
                                                type="password"
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                required
                                                {...field}
                                            />
                                        </FormControl>
                                        {/* --- END CHECK --- */}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root?.serverError && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.serverError.message}</p>
                            )}
                            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Don't have an account yet?{' '}
                        <Link to="/register" className="font-medium text-primary hover:underline underline-offset-2">
                            Sign up here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}