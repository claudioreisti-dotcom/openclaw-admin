#!/usr/bin/env python3
"""
Verifica emails importantes nas caixas configuradas.
Retorna lista de emails que merecem atenção.
"""

import imaplib
import email
from email.header import decode_header
from datetime import datetime, timezone
import json
import os

def decode_str(s):
    if s is None: return ''
    parts = decode_header(s)
    result = []
    for part, enc in parts:
        if isinstance(part, bytes):
            result.append(part.decode(enc or 'utf-8', errors='replace'))
        else:
            result.append(str(part))
    return ''.join(result)

# Remetentes/palavras que indicam importância
IMPORTANT_SENDERS = [
    'noxcare', 'noxtec', 'r4tecnologia', 'prefeitura', 'governo',
    'tribunal', 'receita', 'fazenda', 'banco', 'bradesco', 'itau',
    'santander', 'caixa', 'sebrae', 'anvisa', 'sus', 'datasus'
]

IMPORTANT_SUBJECTS = [
    'urgente', 'urgent', 'importante', 'prazo', 'vencimento', 'vence',
    'contrato', 'pagamento', 'fatura', 'boleto', 'reunião', 'reuniao',
    'proposta', 'aprovação', 'aprovacao', 'cancelamento', 'rescisão',
    'notificação', 'notificacao', 'intimação', 'intimacao', 'multa',
    'licitação', 'licitacao', 'edital', 'pregão', 'pregao'
]

IGNORE_SENDERS = [
    'noreply', 'no-reply', 'marketing', 'newsletter', 'promocao',
    'promoção', 'news', 'notify', 'notification', 'alerts@linkedin',
    'jobalerts', 'smiles', 'bitly', 'drjones', 'insiderstore',
    'scriptcase', 'tivit', 'shopee', 'mercadolivre', 'amazon',
    'americanas', 'magazineluiza', 'ifood', 'rappi', 'shopee', 'mercadolivre', 'amazon',
    'americanas', 'magazine', 'submarino', 'aliexpress', 'shein',
    'ifood', 'rappi', 'uber', 'nubank', 'inter', 'c6bank'
]

def is_important(sender, subject):
    sender_lower = sender.lower()
    subject_lower = subject.lower()
    
    # Ignorar marketing/notificações automáticas
    for ignore in IGNORE_SENDERS:
        if ignore in sender_lower:
            return False, None
    
    # Checar remetentes importantes
    for imp in IMPORTANT_SENDERS:
        if imp in sender_lower:
            return True, f"remetente relevante ({imp})"
    
    # Checar assuntos importantes
    for imp in IMPORTANT_SUBJECTS:
        if imp in subject_lower:
            return True, f"assunto relevante ({imp})"
    
    return False, None

def check_mailbox(host, email_addr, password, label):
    results = []
    try:
        mail = imaplib.IMAP4_SSL(host, 993)
        mail.login(email_addr, password)
        mail.select('inbox')
        
        # Buscar não lidos das últimas 24h
        status, data = mail.search(None, 'UNSEEN')
        if not data[0]:
            mail.logout()
            return results
            
        ids = data[0].split()[-50:]  # últimos 50 não lidos
        
        for uid in reversed(ids):
            try:
                status, msg_data = mail.fetch(uid, '(BODY[HEADER.FIELDS (FROM SUBJECT DATE)])')
                raw = msg_data[0][1]
                msg = email.message_from_bytes(raw)
                sender = decode_str(msg.get('From', ''))
                subject = decode_str(msg.get('Subject', ''))
                date = msg.get('Date', '')[:25]
                
                important, reason = is_important(sender, subject)
                if important:
                    results.append({
                        'label': label,
                        'date': date,
                        'from': sender[:80],
                        'subject': subject[:120],
                        'reason': reason
                    })
            except:
                continue
        
        mail.logout()
    except Exception as e:
        results.append({'label': label, 'error': str(e)})
    
    return results

if __name__ == '__main__':
    all_important = []
    
    # Gmail R4
    all_important += check_mailbox(
        'imap.gmail.com',
        'admin@r4tecnologias.com.br',
        'lrfo pxzu bomh vnvo',
        'Gmail R4'
    )
    
    if all_important:
        print(f"📬 {len(all_important)} email(s) importante(s):")
        for m in all_important:
            if 'error' in m:
                print(f"  ❌ {m['label']}: {m['error']}")
            else:
                print(f"  🔴 [{m['label']}] {m['date']}")
                print(f"     De: {m['from']}")
                print(f"     Assunto: {m['subject']}")
                print(f"     Motivo: {m['reason']}")
    else:
        print("NENHUM_IMPORTANTE")
