from passlib.context import CryptContext
from dotenv import dotenv_values

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1) Test bcrypt tout seul, sans passer par le .env
mot_de_passe_direct = "ueeemig2026"
print("1) Mot de passe ecrit en dur :", repr(mot_de_passe_direct), "- longueur :", len(mot_de_passe_direct))
hash_direct = pwd_context.hash(mot_de_passe_direct)
print("   Hash produit :", hash_direct)
print("   Verification immediate :", pwd_context.verify(mot_de_passe_direct, hash_direct))
print()

# 2) Lire la valeur telle qu'elle sort vraiment du fichier .env
valeurs = dotenv_values(".env")
mot_de_passe_env = valeurs.get("ADMIN_PASSWORD")
print("2) Valeur ADMIN_PASSWORD lue depuis .env :", repr(mot_de_passe_env))
print("   Longueur :", len(mot_de_passe_env) if mot_de_passe_env else "AUCUNE VALEUR TROUVEE")
print("   Identique au mot de passe attendu :", mot_de_passe_env == mot_de_passe_direct)
print()

# 3) Hasher puis verifier la valeur qui vient VRAIMENT du .env
if mot_de_passe_env:
    hash_env = pwd_context.hash(mot_de_passe_env)
    print("3) Hash a partir de la valeur du .env :", hash_env)
    print("   Verification avec 'ueeemig2026' tape en dur :", pwd_context.verify(mot_de_passe_direct, hash_env))
