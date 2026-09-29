"""
Script de demonstration : cree quelques activites (avec les photos deja copiees
dans uploads/activities) et une gestion du bureau avec les 7 postes.

A lancer une fois, apres avoir demarre l'API au moins une fois (pour que les
tables soient creees) :

    cd backend
    python -m app.seed
"""
from datetime import date

from .database import SessionLocal
from . import models
from .routers.activities import slugify, unique_slug

SAMPLE_ACTIVITIES = [
    {
        "title": "Assemblee Generale Annuelle de l'UEE",
        "description": (
            "L'UEE a tenu son Assemblee Generale Annuelle reunissant les etudiants "
            "de l'EMIG autour du bilan de la gestion sortante et des perspectives "
            "pour l'annee academique a venir. Les echanges ont porte sur la vie "
            "estudiantine, les activites academiques et les projets a venir."
        ),
        "location": "Amphitheatre de l'EMIG",
        "activity_date": date(2026, 3, 12),
        "photo": "aag-01.jpg",
    },
    {
        "title": "Conference de sensibilisation des etudiants",
        "description": (
            "Une conference organisee par l'UEE a l'intention des etudiants de "
            "l'EMIG, portant sur l'orientation academique, la reussite universitaire "
            "et l'engagement associatif au sein de l'ecole."
        ),
        "location": "Salle de conference, EMIG",
        "activity_date": date(2026, 2, 20),
        "photo": "conference-01.jpg",
    },
    {
        "title": "Rencontre d'echanges en plein air",
        "description": (
            "Une rencontre conviviale organisee par l'UEE pour renforcer la "
            "cohesion entre les etudiants des differentes options de l'EMIG, "
            "dans une ambiance detendue en fin de journee."
        ),
        "location": "Esplanade de l'EMIG",
        "activity_date": date(2026, 1, 15),
        "photo": "rencontre-plein-air-01.jpg",
    },
    {
        "title": "Tournoi sportif inter-options",
        "description": (
            "Dans le cadre de ses activites culturelles et sportives, l'UEE a "
            "organise un tournoi de basketball opposant les differentes options "
            "de l'EMIG, favorisant l'esprit d'equipe et la vie associative."
        ),
        "location": "Terrain de sport de l'EMIG",
        "activity_date": date(2025, 12, 5),
        "photo": "tournoi-sportif-01.jpg",
    },
]

BUREAU_2025_2026 = [
    {"role": models.Role.SG, "last_name": "MOUSSA", "first_name": "Abdoul Karim", "option": "Genie Informatique"},
    {"role": models.Role.SGA, "last_name": "ISSOUFOU", "first_name": "Hadiza", "option": "Genie Civil"},
    {"role": models.Role.SCP, "last_name": "OUMAROU", "first_name": "Boubacar", "option": "Genie Electrique"},
    {"role": models.Role.SCAA, "last_name": "SANI", "first_name": "Fatouma", "option": "Genie des Mines"},
    {"role": models.Role.SCAS, "last_name": "ADAMOU", "first_name": "Yacouba", "option": "Genie Geologie"},
    {"role": models.Role.SCACS, "last_name": "GARBA", "first_name": "Mariama", "option": "Genie Informatique"},
    {"role": models.Role.SCTG, "last_name": "IBRAHIM", "first_name": "Souleymane", "option": "Genie Civil"},
]


def run():
    db = SessionLocal()
    try:
        if db.query(models.Activity).count() == 0:
            for item in SAMPLE_ACTIVITIES:
                base_slug = slugify(item["title"])
                slug = unique_slug(db, base_slug)
                activity = models.Activity(
                    title=item["title"],
                    slug=slug,
                    description=item["description"],
                    location=item["location"],
                    activity_date=item["activity_date"],
                    is_published=True,
                )
                db.add(activity)
                db.flush()
                photo = models.ActivityPhoto(
                    activity_id=activity.id,
                    file_path=f"/uploads/activities/{item['photo']}",
                    position=0,
                )
                db.add(photo)
            print("[UEE] Activites de demonstration creees.")
        else:
            print("[UEE] Des activites existent deja, aucune activite ajoutee.")

        if db.query(models.Mandate).count() == 0:
            mandate = models.Mandate(
                label="Gestion 2025 - 2026",
                start_date=date(2025, 10, 1),
                end_date=date(2026, 9, 30),
                is_current=True,
            )
            db.add(mandate)
            db.flush()
            for m in BUREAU_2025_2026:
                db.add(models.Member(mandate_id=mandate.id, **m))
            print("[UEE] Bureau de demonstration cree (Gestion 2025-2026).")
        else:
            print("[UEE] Des gestions existent deja, aucune gestion ajoutee.")

        db.commit()
        print("[UEE] Seed termine avec succes.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
