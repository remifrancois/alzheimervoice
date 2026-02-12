#!/usr/bin/env python3
"""
MemoVoice Research Paper Downloader
Downloads all 84 papers from open-access sources into research/downloads/

Sources used (in priority order):
  1. arXiv (free PDFs)
  2. PubMed Central (PMC — open access full text)
  3. Frontiers (open access)
  4. PLOS (open access)
  5. Publisher DOI (landing page / abstract if PDF not free)
  6. Semantic Scholar API (metadata + open access PDF when available)

Usage: python3 research/download_papers.py
"""

import os
import sys
import json
import time
import urllib.request
import urllib.error
import ssl

# Disable SSL verification for academic sites with certificate issues
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
HEADERS = {"User-Agent": "MemoVoice-Research/1.0 (Academic hackathon project; contact: memovoice@cerebralvalley.ai)"}

# ════════════════════════════════════════════════
# PAPER REGISTRY — URLs for all 84 papers
# ════════════════════════════════════════════════

PAPERS = [
    # ── CROSS-VERSION FOUNDATIONS (12) ──
    {
        "id": "grober1987",
        "authors": "Grober & Buschke",
        "year": 1987,
        "title": "Genuine Memory Deficits in Dementia",
        "category": "alzheimer",
        "urls": [
            "https://www.psychologie-aktuell.com/fileadmin/download/PschologyScience/3-2009/03_grober.pdf",
        ]
    },
    {
        "id": "snowdon1996",
        "authors": "Snowdon et al.",
        "year": 1996,
        "title": "Linguistic Ability in Early Life and Cognitive Function and AD in Late Life - Nun Study",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC2734290&blobtype=pdf",
        ]
    },
    {
        "id": "fraser2015",
        "authors": "Fraser, Meltzer & Rudzicz",
        "year": 2015,
        "title": "Linguistic Features Identify Alzheimers Disease in Narrative Speech",
        "category": "alzheimer",
        "urls": [
            "https://www.cs.toronto.edu/~kfraser/Fraser15-JAD.pdf",
            "https://tspace.library.utoronto.ca/bitstream/1807/44987/1/Fraser_Kathleen_C_201411_PhD_thesis.pdf",
        ]
    },
    {
        "id": "pistono2016",
        "authors": "Pistono et al.",
        "year": 2016,
        "title": "Pauses During Autobiographical Discourse Reflect Episodic Memory Processes in Early AD",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC4927846&blobtype=pdf",
        ]
    },
    {
        "id": "mueller2018",
        "authors": "Mueller et al.",
        "year": 2018,
        "title": "Connected Speech and Language in MCI and AD - A Review of Picture Description Tasks",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC6261318&blobtype=pdf",
        ]
    },
    {
        "id": "eyigoz2020",
        "authors": "Eyigoz et al.",
        "year": 2020,
        "title": "Linguistic Markers Predict Onset of Alzheimers Disease",
        "category": "alzheimer",
        "urls": [
            "https://www.thelancet.com/action/showPdf?pii=S2589-5370%2820%2930327-8",
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC7700896&blobtype=pdf",
        ]
    },
    {
        "id": "luz2020",
        "authors": "Luz et al.",
        "year": 2020,
        "title": "Alzheimers Dementia Recognition through Spontaneous Speech - ADReSS Challenge",
        "category": "alzheimer",
        "urls": [
            "https://arxiv.org/pdf/2004.06833",
        ]
    },
    {
        "id": "robin2023",
        "authors": "Robin et al.",
        "year": 2023,
        "title": "Automated Detection of Progressive Speech Changes in Early AD",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC10440286&blobtype=pdf",
        ]
    },
    {
        "id": "kurtz2023",
        "authors": "Kurtz et al.",
        "year": 2023,
        "title": "Early Detection of Cognitive Decline Using Voice Assistant Commands",
        "category": "alzheimer",
        "urls": [
            "https://talkbank.org/dementia/access/0docs/Kurtz23.pdf",
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC12439102&blobtype=pdf",
        ]
    },
    {
        "id": "young2024",
        "authors": "Young et al.",
        "year": 2024,
        "title": "Speech Patterns During Memory Recall Relates to Early Tau Burden",
        "category": "alzheimer",
        "urls": [
            "https://alz-journals.onlinelibrary.wiley.com/doi/pdfdirect/10.1002/alz.13697",
        ]
    },
    {
        "id": "amini2024",
        "authors": "Amini et al.",
        "year": 2024,
        "title": "Prediction of AD Progression Within 6 Years Using Speech",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC11350035&blobtype=pdf",
            "https://www.framinghamheartstudy.org/files/2024/07/Prediction-of-Alzheimer-s-disease-progression-within-6-years-using-speech-2024.pdf",
        ]
    },
    {
        "id": "chou2024",
        "authors": "Chou et al.",
        "year": 2024,
        "title": "Screening for Early AD with Linguistic Features - MLU and LPR",
        "category": "alzheimer",
        "urls": [
            "https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2024.1451326/pdf",
        ]
    },

    # ── ALZHEIMER'S / MCI (30) ──
    {
        "id": "kemper2001",
        "authors": "Kemper et al.",
        "year": 2001,
        "title": "Longitudinal Change in Language Production - Effects of Aging and Dementia",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC1820843&blobtype=pdf",
        ]
    },
    {
        "id": "garrard2005",
        "authors": "Garrard et al.",
        "year": 2005,
        "title": "The Effects of Very Early AD on Writing - Iris Murdoch",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "lopez_de_ipina2013",
        "authors": "Lopez-de-Ipina et al.",
        "year": 2013,
        "title": "Non-Invasive Methods Based on Speech Analysis for AD Diagnosis",
        "category": "alzheimer",
        "urls": [
            "https://www.mdpi.com/1424-8220/13/5/6730/pdf",
        ]
    },
    {
        "id": "ahmed2013",
        "authors": "Ahmed et al.",
        "year": 2013,
        "title": "Connected Speech as a Marker of Disease Progression in Autopsy-Proven AD",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "konig2015",
        "authors": "Konig et al.",
        "year": 2015,
        "title": "Automatic Speech Analysis for Assessment of Patients with Predementia and AD",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC5765043&blobtype=pdf",
        ]
    },
    {
        "id": "szatloczki2015",
        "authors": "Szatloczki et al.",
        "year": 2015,
        "title": "Speaking in Alzheimers Disease Is That an Early Sign",
        "category": "alzheimer",
        "urls": [
            "https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2015.00195/pdf",
        ]
    },
    {
        "id": "yancheva2016",
        "authors": "Yancheva & Rudzicz",
        "year": 2016,
        "title": "Vector-Space Topic Models for Detecting Alzheimers Disease",
        "category": "alzheimer",
        "urls": [
            "https://aclanthology.org/P16-2060.pdf",
        ]
    },
    {
        "id": "orimaye2017",
        "authors": "Orimaye et al.",
        "year": 2017,
        "title": "Predicting Probable AD Using Linguistic Deficits and Biomarkers",
        "category": "alzheimer",
        "urls": [
            "https://bmcbioinformatics.biomedcentral.com/counter/pdf/10.1186/s12859-017-1456-8",
        ]
    },
    {
        "id": "toth2018",
        "authors": "Toth et al.",
        "year": 2018,
        "title": "Speech Recognition-based Solution for Automatic Detection of MCI",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "voleti2019",
        "authors": "Voleti, Liss & Berisha",
        "year": 2019,
        "title": "A Review of Automated Speech and Language Features for Cognitive Disorders",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "balagopalan2020",
        "authors": "Balagopalan et al.",
        "year": 2020,
        "title": "To BERT or Not to BERT - Speech and Language Approaches for AD Detection",
        "category": "alzheimer",
        "urls": [
            "https://arxiv.org/pdf/2008.01551",
        ]
    },
    {
        "id": "yuan2020",
        "authors": "Yuan et al.",
        "year": 2020,
        "title": "Disfluencies and Fine-Tuning Pre-Trained Language Models for AD Detection",
        "category": "alzheimer",
        "urls": [
            "https://arxiv.org/pdf/2009.01862",
        ]
    },
    {
        "id": "haider2020",
        "authors": "Haider, de la Fuente & Luz",
        "year": 2020,
        "title": "Paralinguistic Acoustic Features for Detection of AD in Spontaneous Speech",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "delafuente2020",
        "authors": "de la Fuente Garcia, Ritchie & Luz",
        "year": 2020,
        "title": "AI Speech and Language Processing Approaches to Monitoring AD - Systematic Review",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "petti2020",
        "authors": "Petti, Baker & Korhonen",
        "year": 2020,
        "title": "Systematic Literature Review of Automatic AD Detection from Speech",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "luz2021",
        "authors": "Luz et al.",
        "year": 2021,
        "title": "Detecting Cognitive Decline Using Speech Only - ADReSSo Challenge",
        "category": "alzheimer",
        "urls": [
            "https://www.medrxiv.org/content/10.1101/2021.03.24.21254263v2.full.pdf",
        ]
    },
    {
        "id": "pappagari2021",
        "authors": "Pappagari et al.",
        "year": 2021,
        "title": "Automatic Detection and Assessment of AD Using Speech and Language",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "gauder2021",
        "authors": "Gauder et al.",
        "year": 2021,
        "title": "AD Recognition Using Speech-Based Embeddings From Pre-Trained Models",
        "category": "alzheimer",
        "urls": [
            "https://arxiv.org/pdf/2110.01848",
        ]
    },
    {
        "id": "martinc2021",
        "authors": "Martinc et al.",
        "year": 2021,
        "title": "Temporal Integration for ADReSS - 93.8 Percent Accuracy",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "agbavor2022",
        "authors": "Agbavor & Liang",
        "year": 2022,
        "title": "Predicting Dementia from Spontaneous Speech Using Large Language Models",
        "category": "alzheimer",
        "urls": [
            "https://journals.plos.org/digitalhealth/article/file?id=10.1371/journal.pdig.0000168&type=printable",
        ]
    },
    {
        "id": "nagumo2022",
        "authors": "Nagumo et al.",
        "year": 2022,
        "title": "Automatic Detection of Cognitive Decline Using Telephone Speech",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "bertini2022",
        "authors": "Bertini et al.",
        "year": 2022,
        "title": "Automatic Speech Analysis for AD in Italian Language",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "li2023",
        "authors": "Li et al.",
        "year": 2023,
        "title": "GPT-Based Detection of AD from Clinical Conversations",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "vrahatis2023",
        "authors": "Vrahatis et al.",
        "year": 2023,
        "title": "Machine Learning Approaches for AD Detection from Speech",
        "category": "alzheimer",
        "urls": []
    },
    {
        "id": "speechdx2023",
        "authors": "ADDF",
        "year": 2023,
        "title": "SpeechDx - Gold-Standard Speech Dataset for AD Biomarker Development",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC12742871&blobtype=pdf",
        ]
    },
    {
        "id": "sidead2024",
        "authors": "University of Edinburgh & Sony",
        "year": 2024,
        "title": "SIDE-AD Longitudinal Observational Cohort Study",
        "category": "alzheimer",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC10982798&blobtype=pdf",
        ]
    },
    {
        "id": "shakeri2025",
        "authors": "Shakeri, Farmanbar & Balog",
        "year": 2025,
        "title": "MultiConAD - Unified Multilingual Conversational Dataset for Early AD Detection",
        "category": "alzheimer",
        "urls": [
            "https://arxiv.org/pdf/2502.19208",
        ]
    },

    # ── DEPRESSION (15) ──
    {
        "id": "mundt2007",
        "authors": "Mundt et al.",
        "year": 2007,
        "title": "Voice Acoustic Measures of Depression Severity and Treatment Response",
        "category": "depression",
        "urls": []
    },
    {
        "id": "cohn2009",
        "authors": "Cohn et al.",
        "year": 2009,
        "title": "Detecting Depression from Facial Actions and Vocal Prosody",
        "category": "depression",
        "urls": []
    },
    {
        "id": "quatieri2012",
        "authors": "Quatieri & Williamson",
        "year": 2012,
        "title": "Vocal-Source Biomarkers for Depression - Link to Psychomotor Activity",
        "category": "depression",
        "urls": []
    },
    {
        "id": "alghowinem2013",
        "authors": "Alghowinem et al.",
        "year": 2013,
        "title": "Detecting Depression - Comparison Between Spontaneous and Read Speech",
        "category": "depression",
        "urls": []
    },
    {
        "id": "scherer2014",
        "authors": "Scherer et al.",
        "year": 2014,
        "title": "Voice Quality as Speaker-Independent Indicator of Depression and PTSD",
        "category": "depression",
        "urls": []
    },
    {
        "id": "cummins2015",
        "authors": "Cummins et al.",
        "year": 2015,
        "title": "Review of Depression and Suicide Risk Assessment Using Speech Analysis",
        "category": "depression",
        "urls": []
    },
    {
        "id": "ma2016",
        "authors": "Ma et al. (DepAudioNet)",
        "year": 2016,
        "title": "DepAudioNet - Efficient Deep Model for Audio Based Depression Classification",
        "category": "depression",
        "urls": []
    },
    {
        "id": "harati2018",
        "authors": "Harati et al.",
        "year": 2018,
        "title": "Speech-Based Depression and Neurodegenerative Disease Classification",
        "category": "depression",
        "urls": []
    },
    {
        "id": "avec2019",
        "authors": "Ringeval et al.",
        "year": 2019,
        "title": "AVEC 2019 Workshop and Challenge - Depression Detection with AI",
        "category": "depression",
        "urls": []
    },
    {
        "id": "low2020",
        "authors": "Low, Bentley & Ghosh",
        "year": 2020,
        "title": "Automated Assessment of Psychiatric Disorders Using Speech",
        "category": "depression",
        "urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC7105528&blobtype=pdf",
        ]
    },
    {
        "id": "yamamoto2020",
        "authors": "Yamamoto et al.",
        "year": 2020,
        "title": "Timing-Related Speech Features and Depression Severity",
        "category": "depression",
        "urls": [
            "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0238726&type=printable",
        ]
    },
    {
        "id": "dinkel2020",
        "authors": "Dinkel et al.",
        "year": 2020,
        "title": "Text-Based Depression Detection on Sparse Data",
        "category": "depression",
        "urls": [
            "https://arxiv.org/pdf/1904.05154",
        ]
    },
    {
        "id": "deangel2022",
        "authors": "De Angel et al.",
        "year": 2022,
        "title": "Digital Health Tools for Passive Monitoring of Depression",
        "category": "depression",
        "urls": [
            "https://www.nature.com/articles/s41746-021-00548-8.pdf",
        ]
    },
    {
        "id": "rejaibi2022",
        "authors": "Rejaibi et al.",
        "year": 2022,
        "title": "MFCC-based RNN for Automatic Clinical Depression Recognition",
        "category": "depression",
        "urls": []
    },
    {
        "id": "zhang2022",
        "authors": "Zhang et al.",
        "year": 2022,
        "title": "NLP Applied to Mental Health - Scoping Review",
        "category": "depression",
        "urls": []
    },

    # ── PARKINSON'S (25) ──
    {
        "id": "ramig2001",
        "authors": "Ramig et al.",
        "year": 2001,
        "title": "Intensive Voice Treatment LSVT for Parkinsons Disease",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "harel2004",
        "authors": "Harel et al.",
        "year": 2004,
        "title": "Acoustic Characteristics of Parkinsonian Speech",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "little2007",
        "authors": "Little et al.",
        "year": 2007,
        "title": "Exploiting Nonlinear Recurrence and Fractal Scaling for Voice Disorder Detection",
        "category": "parkinson",
        "urls": [
            "https://biomedical-engineering-online.biomedcentral.com/counter/pdf/10.1186/1475-925X-6-23",
        ]
    },
    {
        "id": "little2009",
        "authors": "Little et al.",
        "year": 2009,
        "title": "Suitability of Dysphonia Measurements for Telemonitoring of Parkinsons Disease",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "sapir2010",
        "authors": "Sapir et al.",
        "year": 2010,
        "title": "Formant Centralization Ratio - New Acoustic Measure of Dysarthric Speech",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "tsanas2010",
        "authors": "Tsanas et al.",
        "year": 2010,
        "title": "Accurate Telemonitoring of Parkinsons Disease Progression",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "rusz2011",
        "authors": "Rusz et al.",
        "year": 2011,
        "title": "Quantitative Acoustic Measurements for Early Untreated Parkinsons Disease",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "skodda2011",
        "authors": "Skodda et al.",
        "year": 2011,
        "title": "Progression of Dysarthria in Parkinsonian Disorders",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "tsanas2012",
        "authors": "Tsanas et al.",
        "year": 2012,
        "title": "Novel Speech Signal Processing Algorithms for High-Accuracy PD Classification",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "rusz2013",
        "authors": "Rusz et al.",
        "year": 2013,
        "title": "Imprecise Vowel Articulation as Potential Early Marker of PD",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "sakar2013",
        "authors": "Sakar et al.",
        "year": 2013,
        "title": "Collection and Analysis of a Parkinson Speech Dataset",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "benba2016",
        "authors": "Benba et al.",
        "year": 2016,
        "title": "Analysis of Voice Recordings Using MFCC for PD Detection",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "orozco2016",
        "authors": "Orozco-Arroyave et al.",
        "year": 2016,
        "title": "Automatic Detection of PD in Running Speech in Three Languages",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "brabenec2017",
        "authors": "Brabenec et al.",
        "year": 2017,
        "title": "Speech Disorders in PD - Early Diagnostics and Effects of Medication",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "godino2017",
        "authors": "Godino-Llorente et al.",
        "year": 2017,
        "title": "Towards Identification of Idiopathic PD from Speech",
        "category": "parkinson",
        "urls": [
            "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0189583&type=printable",
        ]
    },
    {
        "id": "hlavnicka2017",
        "authors": "Hlavnicka et al.",
        "year": 2017,
        "title": "Automated Analysis Reveals Early Biomarkers of PD in REM Sleep Behaviour Disorder",
        "category": "parkinson",
        "urls": [
            "https://www.nature.com/articles/s41598-017-00047-5.pdf",
        ]
    },
    {
        "id": "vaiciukynas2017",
        "authors": "Vaiciukynas et al.",
        "year": 2017,
        "title": "Detecting PD from Sustained Phonation and Speech Signals",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "wroge2018",
        "authors": "Wroge et al.",
        "year": 2018,
        "title": "Parkinsons Disease Diagnosis Using Machine Learning and Voice",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "tracy2020",
        "authors": "Tracy et al.",
        "year": 2020,
        "title": "Investigating Voice as a Biomarker for Early Detection of PD",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "jeancolas2021",
        "authors": "Jeancolas et al.",
        "year": 2021,
        "title": "Automatic Detection of Early Stages of PD through Acoustic Voice Analysis",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "botelho2023",
        "authors": "Botelho et al.",
        "year": 2023,
        "title": "Cross-Lingual Pathological Speech Detection",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "galaz2023",
        "authors": "Galaz et al.",
        "year": 2023,
        "title": "Prosodic and Articulatory Features for PD Detection from Connected Speech",
        "category": "parkinson",
        "urls": [
            "https://www.mdpi.com/1424-8220/23/4/2186/pdf",
        ]
    },
    {
        "id": "moro2024",
        "authors": "Moro-Velazquez et al.",
        "year": 2024,
        "title": "Phonation and Articulation Analysis for Differentiating PD and Essential Tremor",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "suppa2024",
        "authors": "Suppa et al.",
        "year": 2024,
        "title": "Voice Analysis as a Digital Biomarker for PD - Movement Disorders Review",
        "category": "parkinson",
        "urls": []
    },
    {
        "id": "tong2024",
        "authors": "Various (Foundation Models)",
        "year": 2024,
        "title": "Leveraging Pre-trained Speech Models for PD Detection",
        "category": "parkinson",
        "urls": []
    },
]


def download_file(url, filepath):
    """Download a file from URL to filepath."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=30, context=ctx) as response:
            content_type = response.headers.get("Content-Type", "")
            data = response.read()

            if len(data) < 1000:
                return False, f"Too small ({len(data)} bytes)"

            with open(filepath, "wb") as f:
                f.write(data)

            size_kb = len(data) / 1024
            return True, f"{size_kb:.0f}KB"
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return False, f"URL Error: {e.reason}"
    except Exception as e:
        return False, str(e)[:60]


def download_from_semantic_scholar(paper_id, title, filepath):
    """Try to get open access PDF from Semantic Scholar API."""
    try:
        query = urllib.parse.quote(title[:100])
        api_url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&limit=1&fields=openAccessPdf,title"
        req = urllib.request.Request(api_url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            data = json.loads(response.read())
            papers = data.get("data", [])
            if papers and papers[0].get("openAccessPdf"):
                pdf_url = papers[0]["openAccessPdf"]["url"]
                return download_file(pdf_url, filepath)
        return False, "No open access PDF"
    except Exception as e:
        return False, f"S2 API: {str(e)[:40]}"


def main():
    os.makedirs(BASE_DIR, exist_ok=True)

    # Create category subdirectories
    for cat in ["alzheimer", "depression", "parkinson"]:
        os.makedirs(os.path.join(BASE_DIR, cat), exist_ok=True)

    total = len(PAPERS)
    downloaded = 0
    failed = 0
    skipped = 0
    manifest = []

    print(f"\n  MemoVoice Research Paper Downloader")
    print(f"  {total} papers to process\n")

    for i, paper in enumerate(PAPERS):
        pid = paper["id"]
        cat = paper["category"]
        title_safe = paper["title"].replace(" ", "_").replace("/", "-")[:80]
        filename = f"{paper['year']}_{pid}.pdf"
        filepath = os.path.join(BASE_DIR, cat, filename)

        # Skip if already downloaded
        if os.path.exists(filepath) and os.path.getsize(filepath) > 5000:
            print(f"  [{i+1:2d}/{total}] SKIP {pid} (already downloaded)")
            skipped += 1
            manifest.append({"id": pid, "status": "cached", "file": filepath})
            continue

        success = False
        status_msg = ""

        # Try each URL
        for url in paper.get("urls", []):
            success, status_msg = download_file(url, filepath)
            if success:
                break
            time.sleep(0.5)

        # Fallback: try Semantic Scholar
        if not success and paper.get("title"):
            time.sleep(1)  # Rate limit
            success, status_msg = download_from_semantic_scholar(pid, paper["title"], filepath)

        if success:
            downloaded += 1
            print(f"  [{i+1:2d}/{total}] OK   {pid} ({status_msg})")
            manifest.append({"id": pid, "status": "downloaded", "file": filepath, "size": status_msg})
        else:
            failed += 1
            # Create a metadata placeholder
            meta_path = os.path.join(BASE_DIR, cat, f"{paper['year']}_{pid}.meta.txt")
            with open(meta_path, "w") as f:
                f.write(f"Paper: {paper['title']}\n")
                f.write(f"Authors: {paper['authors']}\n")
                f.write(f"Year: {paper['year']}\n")
                f.write(f"Status: Not available for open-access download\n")
                f.write(f"Reason: {status_msg}\n")
                f.write(f"Action: Search on PubMed, Google Scholar, or institution library\n")
            print(f"  [{i+1:2d}/{total}] MISS {pid} ({status_msg}) → meta file created")
            manifest.append({"id": pid, "status": "not_available", "reason": status_msg})

        time.sleep(0.3)  # Be polite to servers

    # Save manifest
    manifest_path = os.path.join(BASE_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump({
            "generated": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total": total,
            "downloaded": downloaded,
            "cached": skipped,
            "not_available": failed,
            "papers": manifest
        }, f, indent=2)

    print(f"\n  ═══════════════════════════════════════")
    print(f"  Downloaded: {downloaded}")
    print(f"  Cached:     {skipped}")
    print(f"  Missing:    {failed} (meta files created)")
    print(f"  Total:      {total}")
    print(f"  ═══════════════════════════════════════")
    print(f"  Output: {BASE_DIR}/")
    print(f"  Manifest: {manifest_path}\n")


if __name__ == "__main__":
    main()
