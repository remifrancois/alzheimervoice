/**
 * Cognito Client — Stubbed for demo mode.
 *
 * The real implementation uses amazon-cognito-identity-js for SRP auth.
 * In demo mode, these functions are never called — AuthProvider uses
 * local demo users instead. This stub avoids bundling the Cognito SDK.
 */

const DEMO_ERROR = 'Cognito is not available in demo mode'

export function initCognitoClient() {}
export function signIn() { return Promise.reject(new Error(DEMO_ERROR)) }
export function completeNewPassword() { return Promise.reject(new Error(DEMO_ERROR)) }
export function signUp() { return Promise.reject(new Error(DEMO_ERROR)) }
export function confirmSignUp() { return Promise.reject(new Error(DEMO_ERROR)) }
export function forgotPassword() { return Promise.reject(new Error(DEMO_ERROR)) }
export function confirmForgotPassword() { return Promise.reject(new Error(DEMO_ERROR)) }
export function getCurrentSession() { return Promise.resolve(null) }
export function signOut() {}
export function globalSignOut() { return Promise.resolve() }
