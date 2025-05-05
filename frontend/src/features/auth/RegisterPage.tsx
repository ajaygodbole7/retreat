// src/pages/RegisterPage.tsx
import { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/auth-context';
import { useRegister } from '@/hooks/useAuth';
import { toast } from "sonner";
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios'; // Import Axios type guard

// Schema and Type remain the same
const registerSchema = z.object({ /* ... */
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const registerMutation = useRegister();

    const form = useForm<RegisterFormValues>({ /* ... */
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '' },
        mode: 'onChange',
    });

    // Redirect Effect remains the same
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            // Removed console.log
            navigate({ to: '/', replace: true });
        }
    }, [isAuthenticated, isAuthLoading, navigate]);

    const onSubmit = async (values: RegisterFormValues) => {
        // Removed console.log
        registerMutation.mutate(values, {
            onSuccess: (data) => {
                toast.success(data.message || "Registration successful! Please check your email.");
                navigate({ to: '/login' });
            },
            onError: (error: unknown) => { // Use unknown for error
                let errorMessage = "Registration failed. Please try again.";
                // Use type guards to safely access error properties
                if (isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message || errorMessage;
                } else if (error instanceof Error) {
                    errorMessage = error.message;
                }
                console.error("RegisterPage: Registration mutation failed:", error); // Keep error log
                toast.error(errorMessage);
                form.setError("root.serverError", { message: errorMessage });
            }
        });
    };

    // Loading/Render logic remains the same
    if (isAuthLoading) { /* ... */
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    if (isAuthenticated) return null;

    // JSX remains the same
    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/20 p-4">
            <Card className="w-full max-w-sm shadow-xl border-border/40">
                {/* ... CardHeader ... */}
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
                    <CardDescription>Enter your details below to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* ... FormFields for name, email, password ... */}
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem> <Label htmlFor="name">Full Name</Label> <FormControl><Input id="name" placeholder="Your Full Name" required {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            <FormField control={form.control} name="email" render={({ field }) => (<FormItem> <Label htmlFor="email">Email Address</Label> <FormControl><Input id="email" type="email" placeholder="you@example.com" required {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            <FormField control={form.control} name="password" render={({ field }) => (<FormItem> <Label htmlFor="password">Password</Label> <FormControl><Input id="password" type="password" required placeholder="••••••" {...field} /></FormControl> <FormMessage /> </FormItem>)} />
                            {/* ... Error display ... */}
                            {form.formState.errors.root?.serverError && (<p className="text-sm font-medium text-destructive">{form.formState.errors.root.serverError.message}</p>)}
                            {/* ... Submit Button ... */}
                            <Button type="submit" className="w-full" disabled={registerMutation.isPending}> {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account </Button>
                        </form>
                    </Form>
                    {/* ... Link to Login ... */}
                    <div className="mt-4 text-center text-sm"> Already have an account?{' '} <Link to="/login" className="font-medium text-primary hover:underline underline-offset-2"> Sign in </Link> </div>
                </CardContent>
            </Card>
        </div>
    );
}