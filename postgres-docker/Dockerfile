# Use official PostgreSQL image
FROM postgres:16

# Copy environment variables file
# COPY backend/.env /docker-entrypoint-initdb.d/.env

# Expose PostgreSQL port
EXPOSE 5432

# Volumes are set in Render, but can define for local dev
VOLUME ["/var/lib/postgresql/data"]
