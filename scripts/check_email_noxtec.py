#!/usr/bin/env python3
"""
Verifica emails importantes da NOXTEC (Microsoft 365)
Retorna: NENHUM_IMPORTANTE ou lista de emails relevantes
"""

import requests
import json
from datetime import datetime, timezone, timedelta

TENANT_ID = "f2bc8c37-afb8-4157-a4af-dea016478e5e"
CLIENT_ID = "42e0e89d-e378-47ce-83e0-c61c6e01a533"
CLIENT_SECRET = "5yi8Q~rG8KDC70E9u_AWZmNf_v7EawXab8dFia2Y"
EMAIL = "claudio.reis@noxtec.com.br"

# Remetentes/assuntos que indicam urgência
URGENTES_REMETENTES = ['diretor', 'ceo', 'presidente', 'cto', 'gestor']
URGENTES_ASSUNTO = ['urgente', 'crítico', 'critico', 'incidente', 'falha', 'fora do ar',
                    'erro crítico', 'atenção', 'importante', 'prazo', 'reunião hoje',
                    'reuniao hoje', 'alerta', 'problema']
IGNORAR_ASSUNTO = ['newsletter', 'noreply', 'unsubscribe', 'promoção', 'oferta',
                   'mensalidade especial', 'desconto']

def get_token():
    r = requests.post(
        f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token",
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "scope": "https://graph.microsoft.com/.default"
        }
    )
    return r.json()["access_token"]

def verificar():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Buscar não lidos das últimas 4 horas
    desde = (datetime.now(timezone.utc) - timedelta(hours=4)).strftime("%Y-%m-%dT%H:%M:%SZ")
    url = (
        f"https://graph.microsoft.com/v1.0/users/{EMAIL}/messages"
        f"?$filter=isRead eq false and receivedDateTime ge {desde}"
        f"&$select=subject,from,receivedDateTime,importance,isRead"
        f"&$top=20&$orderby=receivedDateTime desc"
    )
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return

    msgs = r.json().get("value", [])
    importantes = []

    for m in msgs:
        assunto = m.get("subject", "").lower()
        remetente = m.get("from", {}).get("emailAddress", {})
        nome_rem = remetente.get("name", "").lower()
        importance = m.get("importance", "normal")

        # Ignorar newsletters/marketing
        if any(k in assunto for k in IGNORAR_ASSUNTO):
            continue

        motivo = None

        if importance == "high":
            motivo = "marcado como importante"
        elif any(k in assunto for k in URGENTES_ASSUNTO):
            motivo = f"assunto relevante"
        elif any(k in nome_rem for k in URGENTES_REMETENTES):
            motivo = f"remetente relevante"

        if motivo:
            importantes.append({
                "de": remetente.get("name", remetente.get("address", "")),
                "assunto": m.get("subject", ""),
                "data": m.get("receivedDateTime", "")[:16].replace("T", " "),
                "motivo": motivo
            })

    if not importantes:
        print("NENHUM_IMPORTANTE")
        return

    print(f"📬 {len(importantes)} email(s) importante(s) na NOXTEC:")
    for e in importantes:
        print(f"  🔴 [{e['data']}]")
        print(f"     De: {e['de']}")
        print(f"     Assunto: {e['assunto']}")
        print(f"     Motivo: {e['motivo']}")

if __name__ == "__main__":
    verificar()
