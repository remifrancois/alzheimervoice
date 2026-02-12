#!/usr/bin/env python3
"""
Retry missing papers with alternative sources.
For papers without open-access PDFs, fetch abstracts + key data from PubMed.
"""

import os
import json
import time
import urllib.request
import urllib.error
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
HEADERS = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

# Alternative URLs and PubMed IDs for missing papers
MISSING_PAPERS = [
    # ── Alzheimer's ──
    {
        "id": "young2024", "category": "alzheimer",
        "title": "Speech Patterns During Memory Recall Relates to Early Tau Burden Across Adulthood",
        "authors": "Young AL et al.", "year": 2024,
        "journal": "Alzheimer's & Dementia, 20(4), 2552-2563",
        "pmid": "38924662",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC11247373&blobtype=pdf",
        ]
    },
    {
        "id": "garrard2005", "category": "alzheimer",
        "title": "The Effects of Very Early Alzheimer's Disease on the Characteristics of Writing by a Renowned Author",
        "authors": "Garrard P, Maloney LM, Hodges JR, Patterson K", "year": 2005,
        "journal": "Brain, 128(2), 250-260",
        "pmid": "15574466",
        "alt_urls": []
    },
    {
        "id": "lopez_de_ipina2013", "category": "alzheimer",
        "title": "On the Selection of Non-Invasive Methods Based on Speech Analysis for AD Diagnosis",
        "authors": "Lopez-de-Ipina K et al.", "year": 2013,
        "journal": "Sensors, 13(5), 6730-6745",
        "pmid": "23698268",
        "alt_urls": [
            "https://www.mdpi.com/1424-8220/13/5/6730/pdf",
        ]
    },
    {
        "id": "ahmed2013", "category": "alzheimer",
        "title": "Connected Speech as a Marker of Disease Progression in Autopsy-Proven Alzheimer's Disease",
        "authors": "Ahmed S, de Jager CA, Haigh AF, Garrard P", "year": 2013,
        "journal": "Brain, 136(12), 3727-3737",
        "pmid": "24142145",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC3859216&blobtype=pdf",
        ]
    },
    {
        "id": "haider2020", "category": "alzheimer",
        "title": "An Assessment of Paralinguistic Acoustic Features for Detection of Alzheimer's Dementia",
        "authors": "Haider F, de la Fuente S, Luz S", "year": 2020,
        "journal": "Journal of Alzheimer's Disease, 78(4), 1523-1538",
        "pmid": "33164926",
        "alt_urls": []
    },
    {
        "id": "petti2020", "category": "alzheimer",
        "title": "A Systematic Literature Review of Automatic AD Detection from Speech and Language",
        "authors": "Petti U, Baker S, Korhonen A", "year": 2020,
        "journal": "JAMIA, 27(11), 1784-1797",
        "pmid": "32929494",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC7671618&blobtype=pdf",
        ]
    },
    {
        "id": "pappagari2021", "category": "alzheimer",
        "title": "Automatic Detection and Assessment of Alzheimer Disease Using Speech and Language Technologies",
        "authors": "Pappagari R et al.", "year": 2021,
        "journal": "Proceedings of Interspeech 2021",
        "alt_urls": [
            "https://arxiv.org/pdf/2105.09405",
        ]
    },
    {
        "id": "martinc2021", "category": "alzheimer",
        "title": "Temporal Integration for ADReSS Challenge",
        "authors": "Martinc M et al.", "year": 2021,
        "journal": "Frontiers in Aging Neuroscience",
        "alt_urls": [
            "https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2021.642647/pdf",
        ]
    },
    {
        "id": "nagumo2022", "category": "alzheimer",
        "title": "Automatic Detection of Cognitive Decline Using Telephone Speech",
        "authors": "Nagumo R et al.", "year": 2022,
        "alt_urls": []
    },
    {
        "id": "bertini2022", "category": "alzheimer",
        "title": "Automatic Speech Analysis for AD Assessment in Italian Language",
        "authors": "Bertini F et al.", "year": 2022,
        "alt_urls": []
    },
    {
        "id": "li2023", "category": "alzheimer",
        "title": "GPT-Based Detection of Alzheimer's Disease from Clinical Conversations",
        "authors": "Li R et al.", "year": 2023,
        "alt_urls": [
            "https://arxiv.org/pdf/2306.09522",
        ]
    },
    {
        "id": "vrahatis2023", "category": "alzheimer",
        "title": "Machine Learning Approaches for AD Detection from Speech",
        "authors": "Vrahatis AG et al.", "year": 2023,
        "alt_urls": []
    },

    # ── Depression ──
    {
        "id": "mundt2007", "category": "depression",
        "title": "Voice Acoustic Measures of Depression Severity and Treatment Response",
        "authors": "Mundt JC, Snyder PJ, Cannizzaro MS, Chappie K, Geralts DS", "year": 2007,
        "journal": "Journal of Neurolinguistics, 20(1), 50-64",
        "alt_urls": []
    },
    {
        "id": "cohn2009", "category": "depression",
        "title": "Detecting Depression from Facial Actions and Vocal Prosody",
        "authors": "Cohn JF et al.", "year": 2009,
        "journal": "ACII 2009",
        "alt_urls": [
            "https://www.ri.cmu.edu/pub_files/2009/9/Cohn_etal_ACII09_paper116.pdf",
        ]
    },
    {
        "id": "quatieri2012", "category": "depression",
        "title": "Vocal-Source Biomarkers for Depression: A Link to Psychomotor Activity",
        "authors": "Quatieri TF, Malyska N", "year": 2012,
        "journal": "Proceedings of INTERSPEECH 2012",
        "alt_urls": []
    },
    {
        "id": "alghowinem2013", "category": "depression",
        "title": "Detecting Depression: A Comparison Between Spontaneous and Read Speech",
        "authors": "Alghowinem S et al.", "year": 2013,
        "journal": "ICASSP 2013",
        "alt_urls": []
    },
    {
        "id": "scherer2014", "category": "depression",
        "title": "Investigating Voice Quality as a Speaker-Independent Indicator of Depression and PTSD",
        "authors": "Scherer S, Stratou G, Gratch J, Morency LP", "year": 2014,
        "journal": "Proceedings of INTERSPEECH 2014",
        "alt_urls": []
    },
    {
        "id": "cummins2015", "category": "depression",
        "title": "A Review of Depression and Suicide Risk Assessment Using Speech Analysis",
        "authors": "Cummins N, Scherer S, Krajewski J, Schnieder S, Epps J, Quatieri TF", "year": 2015,
        "journal": "Speech Communication, 71, 10-49",
        "alt_urls": []
    },
    {
        "id": "ma2016", "category": "depression",
        "title": "DepAudioNet: An Efficient Deep Model for Audio Based Depression Classification",
        "authors": "Ma X, Yang H, Chen Q, Huang D, Wang Y", "year": 2016,
        "journal": "AVEC Workshop 2016",
        "alt_urls": [
            "https://arxiv.org/pdf/1611.00843",
        ]
    },
    {
        "id": "harati2018", "category": "depression",
        "title": "Speech-Based Depression and Neurodegenerative Disease Classification",
        "authors": "Harati A, Gollapalli S, Satt A", "year": 2018,
        "journal": "INTERSPEECH 2018",
        "alt_urls": []
    },
    {
        "id": "avec2019", "category": "depression",
        "title": "AVEC 2019 Workshop and Challenge: Depression Detection with AI",
        "authors": "Ringeval F et al.", "year": 2019,
        "journal": "AVEC Workshop 2019",
        "alt_urls": [
            "https://arxiv.org/pdf/1907.11510",
        ]
    },
    {
        "id": "rejaibi2022", "category": "depression",
        "title": "MFCC-based Recurrent Neural Network for Clinical Depression Recognition",
        "authors": "Rejaibi E et al.", "year": 2022,
        "journal": "Biomedical Signal Processing and Control, 73, 103372",
        "alt_urls": []
    },
    {
        "id": "zhang2022", "category": "depression",
        "title": "Natural Language Processing Applied to Mental Health: A Recent Scoping Review",
        "authors": "Zhang T, Schoene AM, Ji S, Ananiadou S", "year": 2022,
        "journal": "Computational Linguistics, 48(4), 781-816",
        "alt_urls": [
            "https://direct.mit.edu/coli/article-pdf/48/4/781/2057792/coli_a_00455.pdf",
        ]
    },

    # ── Parkinson's ──
    {
        "id": "harel2004", "category": "parkinson",
        "title": "Acoustic Characteristics of Parkinsonian Speech: A Potential Biomarker",
        "authors": "Harel BT, Cannizzaro MS, Cohen H, Reilly N, Snyder PJ", "year": 2004,
        "journal": "Journal of Neurolinguistics, 17(6), 439-453",
        "alt_urls": []
    },
    {
        "id": "little2009_ieee", "category": "parkinson",
        "title": "Suitability of Dysphonia Measurements for Telemonitoring of Parkinson's Disease",
        "authors": "Little MA et al.", "year": 2009,
        "journal": "IEEE Trans Biomed Eng, 56(4), 1015-1022",
        "pmid": "19272902",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC2722959&blobtype=pdf",
        ]
    },
    {
        "id": "sapir2010", "category": "parkinson",
        "title": "Formant Centralization Ratio: A Proposal for a New Acoustic Measure",
        "authors": "Sapir S, Ramig LO, Spielman JL, Fox C", "year": 2010,
        "journal": "JSLHR, 53(1), 114-125",
        "pmid": "19948760",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC2820297&blobtype=pdf",
        ]
    },
    {
        "id": "tsanas2010", "category": "parkinson",
        "title": "Accurate Telemonitoring of Parkinson's Disease Progression",
        "authors": "Tsanas A et al.", "year": 2010,
        "journal": "IEEE Trans Biomed Eng, 57(4), 884-893",
        "alt_urls": [
            "https://www.max-little.net/pub/Tsanas_TBME_2010.pdf",
        ]
    },
    {
        "id": "rusz2011", "category": "parkinson",
        "title": "Quantitative Acoustic Measurements for Early Untreated PD",
        "authors": "Rusz J, Cmejla R, Ruzickova H, Ruzicka E", "year": 2011,
        "journal": "JASA, 129(1), 350-367",
        "alt_urls": []
    },
    {
        "id": "skodda2011", "category": "parkinson",
        "title": "Progression of Dysarthria and Dysphagia in Parkinsonian Disorders",
        "authors": "Skodda S, Visser W, Schlegel U", "year": 2011,
        "journal": "Journal of Neurology, 258(1), 81-86",
        "alt_urls": []
    },
    {
        "id": "tsanas2012", "category": "parkinson",
        "title": "Novel Speech Signal Processing Algorithms for High-Accuracy PD Classification",
        "authors": "Tsanas A et al.", "year": 2012,
        "journal": "IEEE Trans Biomed Eng, 59(5), 1264-1271",
        "alt_urls": [
            "https://www.max-little.net/pub/Tsanas_TBME_2012.pdf",
        ]
    },
    {
        "id": "rusz2013", "category": "parkinson",
        "title": "Imprecise Vowel Articulation as Potential Early Marker of PD",
        "authors": "Rusz J et al.", "year": 2013,
        "journal": "JASA, 134(3), 2171-2181",
        "alt_urls": []
    },
    {
        "id": "sakar2013", "category": "parkinson",
        "title": "Collection and Analysis of a Parkinson Speech Dataset",
        "authors": "Sakar BE et al.", "year": 2013,
        "journal": "IEEE JBHI, 17(4), 828-834",
        "alt_urls": []
    },
    {
        "id": "benba2016", "category": "parkinson",
        "title": "Analysis of Voice Recordings Using MFCC for PD Detection",
        "authors": "Benba A, Jilbab A, Hammouch A", "year": 2016,
        "journal": "International Journal of Speech Technology, 19(3), 449-456",
        "alt_urls": []
    },
    {
        "id": "orozco2016", "category": "parkinson",
        "title": "Automatic Detection of PD in Running Speech in Three Languages",
        "authors": "Orozco-Arroyave JR et al.", "year": 2016,
        "journal": "JASA, 139(1), 481-500",
        "alt_urls": []
    },
    {
        "id": "brabenec2017", "category": "parkinson",
        "title": "Speech Disorders in PD: Early Diagnostics and Effects of Medication",
        "authors": "Brabenec L et al.", "year": 2017,
        "journal": "Journal of Neural Transmission, 124(3), 303-334",
        "pmid": "27709317",
        "alt_urls": [
            "https://europepmc.org/backend/ptpmcrender.fcgi?accid=PMC5281670&blobtype=pdf",
        ]
    },
    {
        "id": "vaiciukynas2017", "category": "parkinson",
        "title": "Detecting PD from Sustained Phonation and Speech Signals",
        "authors": "Vaiciukynas E et al.", "year": 2017,
        "journal": "Applied Mathematics and Computation, 307, 151-160",
        "alt_urls": []
    },
    {
        "id": "wroge2018", "category": "parkinson",
        "title": "PD Diagnosis Using Machine Learning and Voice",
        "authors": "Wroge TJ et al.", "year": 2018,
        "journal": "IEEE SPMB",
        "alt_urls": []
    },
    {
        "id": "tracy2020", "category": "parkinson",
        "title": "Investigating Voice as a Biomarker for Early Detection of PD",
        "authors": "Tracy JM et al.", "year": 2020,
        "journal": "J Biomedical Informatics, 104, 103362",
        "alt_urls": []
    },
    {
        "id": "botelho2023", "category": "parkinson",
        "title": "Cross-Lingual Pathological Speech Detection",
        "authors": "Botelho C et al.", "year": 2023,
        "journal": "INTERSPEECH 2023",
        "alt_urls": [
            "https://arxiv.org/pdf/2305.12530",
        ]
    },
    {
        "id": "galaz2023", "category": "parkinson",
        "title": "Prosodic and Articulatory Features for PD Detection from Connected Speech",
        "authors": "Galaz Z et al.", "year": 2023,
        "journal": "Sensors, 23(4), 2186",
        "alt_urls": [
            "https://www.mdpi.com/1424-8220/23/4/2186/pdf",
        ]
    },
    {
        "id": "moro2024", "category": "parkinson",
        "title": "Phonation and Articulation for Differentiating PD and Essential Tremor",
        "authors": "Moro-Velazquez L et al.", "year": 2024,
        "journal": "Speech Communication",
        "alt_urls": []
    },
    {
        "id": "suppa2024", "category": "parkinson",
        "title": "Voice Analysis as a Digital Biomarker for PD",
        "authors": "Suppa A et al.", "year": 2024,
        "journal": "Movement Disorders (review)",
        "alt_urls": []
    },
    {
        "id": "tong2024", "category": "parkinson",
        "title": "Leveraging Pre-trained Speech Models for PD Detection",
        "authors": "Various Groups", "year": 2024,
        "journal": "Various (IEEE, INTERSPEECH)",
        "alt_urls": []
    },
]


def fetch_url(url, timeout=20):
    """Fetch URL content."""
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return resp.read(), resp.headers.get("Content-Type", "")
    except Exception as e:
        return None, str(e)


def download_pdf(url, filepath):
    """Download PDF from URL."""
    data, ct = fetch_url(url)
    if data and len(data) > 2000:
        with open(filepath, "wb") as f:
            f.write(data)
        return True, f"{len(data)//1024}KB"
    return False, ct if isinstance(ct, str) else "too small"


def fetch_pubmed_abstract(pmid):
    """Fetch abstract and metadata from PubMed E-utilities."""
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id={pmid}&rettype=abstract&retmode=text"
    data, _ = fetch_url(url)
    if data:
        return data.decode("utf-8", errors="replace")
    return None


def fetch_europmc_abstract(title):
    """Search Europe PMC for abstract."""
    query = urllib.parse.quote(title[:120])
    url = f"https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={query}&format=json&resultType=core&pageSize=1"
    data, _ = fetch_url(url)
    if data:
        try:
            result = json.loads(data)
            hits = result.get("resultList", {}).get("result", [])
            if hits:
                hit = hits[0]
                abstract = hit.get("abstractText", "")
                return {
                    "title": hit.get("title", ""),
                    "authors": hit.get("authorString", ""),
                    "journal": hit.get("journalTitle", ""),
                    "year": hit.get("pubYear", ""),
                    "doi": hit.get("doi", ""),
                    "pmid": hit.get("pmid", ""),
                    "pmcid": hit.get("pmcid", ""),
                    "abstract": abstract,
                    "isOpenAccess": hit.get("isOpenAccess", "N"),
                    "fullTextUrl": hit.get("fullTextUrlList", {}).get("fullTextUrl", []),
                }
        except Exception:
            pass
    return None


def write_summary(filepath, paper, pubmed_text=None, epmc_data=None):
    """Write a research summary file."""
    with open(filepath, "w") as f:
        f.write(f"# {paper.get('title', 'Unknown')}\n\n")
        f.write(f"**Authors:** {paper.get('authors', 'Unknown')}\n")
        f.write(f"**Year:** {paper.get('year', 'Unknown')}\n")
        f.write(f"**Journal:** {paper.get('journal', 'Unknown')}\n")
        if paper.get("pmid"):
            f.write(f"**PubMed:** https://pubmed.ncbi.nlm.nih.gov/{paper['pmid']}/\n")
        if epmc_data:
            if epmc_data.get("doi"):
                f.write(f"**DOI:** https://doi.org/{epmc_data['doi']}\n")
            if epmc_data.get("pmcid"):
                f.write(f"**PMC:** https://europepmc.org/article/PMC/{epmc_data['pmcid']}\n")
        f.write(f"\n---\n\n")

        if epmc_data and epmc_data.get("abstract"):
            f.write(f"## Abstract\n\n{epmc_data['abstract']}\n\n")
        elif pubmed_text:
            f.write(f"## PubMed Record\n\n{pubmed_text}\n\n")
        else:
            f.write(f"## Status\n\nPDF not available via open access. Abstract retrieval attempted.\n")
            f.write(f"Search manually on PubMed or Google Scholar.\n\n")

        f.write(f"---\n*Retrieved by MemoVoice research downloader*\n")


def main():
    total = len(MISSING_PAPERS)
    pdf_ok = 0
    summary_ok = 0
    still_missing = 0

    print(f"\n  MemoVoice — Retry Missing Papers")
    print(f"  {total} papers to retry\n")

    for i, paper in enumerate(MISSING_PAPERS):
        pid = paper["id"]
        cat = paper["category"]
        cat_dir = os.path.join(BASE_DIR, cat)
        os.makedirs(cat_dir, exist_ok=True)

        pdf_path = os.path.join(cat_dir, f"{paper['year']}_{pid}.pdf")
        summary_path = os.path.join(cat_dir, f"{paper['year']}_{pid}_summary.md")

        # Skip if PDF already exists
        if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 5000:
            print(f"  [{i+1:2d}/{total}] CACHED {pid}")
            pdf_ok += 1
            continue

        # Skip if summary already exists
        if os.path.exists(summary_path) and os.path.getsize(summary_path) > 200:
            print(f"  [{i+1:2d}/{total}] SUMRY  {pid} (already have summary)")
            summary_ok += 1
            continue

        # Try alternative PDF URLs
        got_pdf = False
        for url in paper.get("alt_urls", []):
            if not url:
                continue
            ok, msg = download_pdf(url, pdf_path)
            if ok:
                print(f"  [{i+1:2d}/{total}] PDF    {pid} ({msg})")
                pdf_ok += 1
                got_pdf = True
                # Remove old meta file
                meta_path = os.path.join(cat_dir, f"{paper['year']}_{pid}.meta.txt")
                if os.path.exists(meta_path):
                    os.remove(meta_path)
                break
            time.sleep(0.3)

        if got_pdf:
            continue

        # No PDF available — fetch abstract/summary
        pubmed_text = None
        epmc_data = None

        # Try PubMed
        if paper.get("pmid"):
            time.sleep(0.4)
            pubmed_text = fetch_pubmed_abstract(paper["pmid"])

        # Try Europe PMC (more generous API)
        if paper.get("title"):
            time.sleep(0.4)
            epmc_data = fetch_europmc_abstract(paper["title"])

            # If Europe PMC found an open access PDF, try it
            if epmc_data and epmc_data.get("isOpenAccess") == "Y":
                for ft_url in epmc_data.get("fullTextUrl", []):
                    if ft_url.get("documentStyle") == "pdf":
                        ok, msg = download_pdf(ft_url["url"], pdf_path)
                        if ok:
                            print(f"  [{i+1:2d}/{total}] PDF    {pid} (via EuropePMC, {msg})")
                            pdf_ok += 1
                            got_pdf = True
                            break

            # Try PMC PDF directly
            if not got_pdf and epmc_data and epmc_data.get("pmcid"):
                pmcid = epmc_data["pmcid"]
                pmc_pdf = f"https://europepmc.org/backend/ptpmcrender.fcgi?accid={pmcid}&blobtype=pdf"
                ok, msg = download_pdf(pmc_pdf, pdf_path)
                if ok:
                    print(f"  [{i+1:2d}/{total}] PDF    {pid} (via PMC {pmcid}, {msg})")
                    pdf_ok += 1
                    got_pdf = True

        if got_pdf:
            continue

        # Write summary file
        if pubmed_text or (epmc_data and epmc_data.get("abstract")):
            write_summary(summary_path, paper, pubmed_text, epmc_data)
            print(f"  [{i+1:2d}/{total}] SUMRY  {pid} (abstract saved)")
            summary_ok += 1
        else:
            write_summary(summary_path, paper)
            print(f"  [{i+1:2d}/{total}] STUB   {pid} (no abstract found)")
            still_missing += 1

        time.sleep(0.3)

    print(f"\n  ═══════════════════════════════════════")
    print(f"  PDFs downloaded:    {pdf_ok}")
    print(f"  Summaries saved:    {summary_ok}")
    print(f"  Still missing:      {still_missing}")
    print(f"  Total processed:    {total}")
    print(f"  ═══════════════════════════════════════\n")


if __name__ == "__main__":
    main()
