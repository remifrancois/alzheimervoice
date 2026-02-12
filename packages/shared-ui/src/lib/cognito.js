/**
 * Cognito Client — Thin promise wrapper around amazon-cognito-identity-js.
 *
 * Provides: signIn, signUp, confirmSignUp, forgotPassword,
 * confirmForgotPassword, signOut, getSession.
 *
 * No Amplify dependency — lightweight SRP authentication.
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js'

let _pool = null

export function initCognitoClient({ userPoolId, clientId }) {
  _pool = new CognitoUserPool({ UserPoolId: userPoolId, ClientId: clientId })
}

function getPool() {
  if (!_pool) throw new Error('Cognito client not initialized')
  return _pool
}

/** Sign in with email + password. */
export function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getPool() })
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          payload: session.getIdToken().decodePayload(),
        })
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: (userAttributes) => {
        delete userAttributes.email_verified
        delete userAttributes.email
        resolve({ newPasswordRequired: true, user, userAttributes })
      },
    })
  })
}

/** Complete new password challenge (admin-created users). */
export function completeNewPassword(cognitoUser, newPassword, userAttributes) {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
      onSuccess: (session) => {
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          payload: session.getIdToken().decodePayload(),
        })
      },
      onFailure: reject,
    })
  })
}

/** Register a new user. */
export function signUp(email, password, name) {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
    ]
    getPool().signUp(email, password, attributes, null, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/** Confirm registration with verification code. */
export function confirmSignUp(email, code) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getPool() })
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/** Initiate forgot password flow. */
export function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getPool() })
    user.forgotPassword({ onSuccess: resolve, onFailure: reject })
  })
}

/** Confirm forgot password with code + new password. */
export function confirmForgotPassword(email, code, newPassword) {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({ Username: email, Pool: getPool() })
    user.confirmPassword(code, newPassword, { onSuccess: () => resolve(), onFailure: reject })
  })
}

/** Restore current session from localStorage (auto-refresh if needed). */
export function getCurrentSession() {
  return new Promise((resolve) => {
    const user = getPool().getCurrentUser()
    if (!user) return resolve(null)

    user.getSession((err, session) => {
      if (err || !session || !session.isValid()) return resolve(null)
      resolve({
        idToken: session.getIdToken().getJwtToken(),
        accessToken: session.getAccessToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
        payload: session.getIdToken().decodePayload(),
        user,
      })
    })
  })
}

/** Sign out (clears local session). */
export function signOut() {
  const user = getPool().getCurrentUser()
  if (user) user.signOut()
}

/** Global sign out (invalidates all sessions). */
export function globalSignOut() {
  return new Promise((resolve, reject) => {
    const user = getPool().getCurrentUser()
    if (!user) return resolve()
    user.getSession((err) => {
      if (err) return resolve()
      user.globalSignOut({ onSuccess: resolve, onFailure: reject })
    })
  })
}
