# Auth Module

Auth is based on OTP that means user doesn't have to set a password. Everytime user logins, they need to send an OTP to their desired channel (email or phone) and confirm it.

We don't store the OTP in plain text in our database. Hashing is done on the OTP and then its stored in db. Whenever OTP needs to be verified, a hash is created again and then compared with the one stored in DB. OTP also have a expiry time which is set dynamically.

There are 2 mutations:

- `sendOTP` - To send OTP to the user, depending on `username` which can be either phone or email.
- `login` - To login the user and verify the OTP, `username` can be either phone or email 

# Decorators

There are few decorators which will help developers authenticate the user on resolvers.

## 1. `@Auth(role[s])` Decorator

This decorator can be used on top of any mutation/query or whole resolver. It takes multiple roles as params so that only those roles are allowed to access that resource.

## 2. `@AuthUser()` Decorator

This is a param decorator that means it can be used in the params of any resolver function. Purpose of this is to get logged in user's details. It also has a helper function `hasRole(role[s])` which can be used to find out if this user has certain role[s] or not.