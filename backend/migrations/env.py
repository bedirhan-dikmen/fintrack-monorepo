import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# 1. Alembic Yapılandırma Nesnesi
config = context.config

# 2. Python logger ayarlarını alembic.ini içeriğine göre yüklüyoruz
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 3. Kendi yazdığımız modellerin metadata yapısını bağlıyoruz (Dinamik DB için)
from app.models.base import Base
from app.models.card import Card

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Offline modda göçleri çalıştır."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online() -> None:
    """Online (canlı DB bağlantısı ile) göçleri asenkron çalıştır."""
    
    # alembic.ini dosyasından ayarları okuyoruz
    configuration = config.get_section(config.config_ini_section) or {}
    
    # ÇOK KRİTİK: İmaj içinde psycopg2 aramaması için URL'i zorunlu olarak asenkron sürücüye (+asyncpg) çeviriyoruz
    if "sqlalchemy.url" in configuration:
        configuration["sqlalchemy.url"] = configuration["sqlalchemy.url"].replace(
            "postgresql://", "postgresql+asyncpg://"
        )

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

if context.is_offline_mode():
    run_migrations_offline()
else:
    # Asenkron fonksiyonu event loop üzerinde tetikliyoruz
    asyncio.run(run_migrations_online())