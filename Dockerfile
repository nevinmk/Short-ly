# FROM <image>:<tag>
# Base image to build on top of. Using node:20-alpine (Node.js 20 on Alpine
# Linux) keeps the image small since Alpine ships far fewer packages than
# Debian-based Node images.
FROM node:20-alpine

# WORKDIR <path>
# Sets the working directory inside the container for all instructions that
# follow (RUN, COPY, CMD, etc.). Creates the directory if it doesn't exist.
WORKDIR /app

# COPY <src>... <dest>
# Copies files from the build context into the image. Only the manifests are
# copied here (not the full source) so Docker's layer cache can reuse the
# npm ci layer below on rebuilds as long as these two files haven't changed.
COPY package.json package-lock.json ./

# RUN <command>
# Executes a command at build time and commits the result as a new layer.
# `npm ci` installs the exact versions pinned in package-lock.json (unlike
# `npm install`, it won't update the lockfile) and fails if the lockfile is
# out of sync. `--omit=dev` skips devDependencies since this is a
# production image.
RUN npm ci --omit=dev

# COPY <src>... <dest>
# Copies the application source after dependencies are installed, so editing
# server.js doesn't invalidate (and force a re-run of) the npm ci layer above.
COPY server.js ./

# EXPOSE <port>
# Documents which port the container listens on. This is metadata only —
# it doesn't publish the port; that still requires `docker run -p 3000:3000`.
EXPOSE 3000

# CMD ["executable", "arg1", ...]
# The default command run when the container starts (exec form, no shell).
# Can be overridden by passing a command to `docker run`.
CMD ["node", "server.js"]
