{
  "updated_script_name": "daily_intel_ingest_v2.py",
  "description": "This script fetches and preprocesses NVD CVEs, MITRE ATT&CK (Enterprise & ICS), CISA Alerts & Current Activity (RSS), and MSRC Bulletins (API), outputting normalized JSONL files.",
  "requirements": [
    "requests",
    "tqdm",
    "feedparser"
  ],
  "script_content": """
#!/usr/bin/env python3
\"\"\"
daily_intel_ingest_v2.py

Fetches raw threat feeds (MITRE ATT&CK STIX for Enterprise & ICS, NVD CVE JSON, 
CISA RSS feeds, MSRC API), parses relevant fields, and writes normalized 
JSONL files for downstream summarization.

Requirements:
  pip install requests tqdm feedparser

Usage:
  python3 daily_intel_ingest_v2.py --output_dir /path/to/output --lookback_days 1
\"\"\"

import os
import sys
import json
import gzip
import argparse
import logging
from datetime import datetime, timedelta, timezone
from tqdm import tqdm
import requests

try:
    import feedparser
except ImportError:
    print("Please install feedparser: pip install feedparser", file=sys.stderr)
    sys.exit(1)

# Configure verbose logging
logger = logging.getLogger("IntelIngest")
logger.setLevel(logging.DEBUG) # Set to INFO for less verbosity in production
ch = logging.StreamHandler(sys.stdout) # Log to stdout
ch.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s - %(message)s")
ch.setFormatter(formatter)
if not logger.handlers: # Avoid adding multiple handlers if script is reloaded
    logger.addHandler(ch)


DEFAULT_USER_AGENT = "ThreatIntelIngestor/1.0 (+https://github.com/your-repo; contact your-email@example.com)"

def fetch_url(url, headers=None, decompress_gzip=False, timeout=60, is_json=True):
    \"\"\"
    Fetches content from a URL. If decompress_gzip is True, decompresses gzip.
    Returns raw bytes (decompressed if needed) or parsed JSON if is_json is True.
    \"\"\"
    effective_headers = {"User-Agent": DEFAULT_USER_AGENT}
    if headers:
        effective_headers.update(headers)
    
    try:
        logger.info(f"Fetching: {url}")
        resp = requests.get(url, headers=effective_headers, timeout=timeout, stream=True)
        resp.raise_for_status()
        
        if decompress_gzip:
            content_bytes = gzip.decompress(resp.raw.read())
        else:
            content_bytes = resp.raw.read()

        if is_json:
            return json.loads(content_bytes.decode('utf-8'))
        return content_bytes
    except requests.RequestException as e:
        logger.error(f"Error fetching {url}: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from {url}: {e}")
        return None
    except gzip.BadGzipFile as e:
        logger.error(f"Error decompressing Gzip from {url}: {e}")
        return None

def parse_nvd_json(nvd_data, output_path):
    \"\"\"
    Parses NVD JSON data and writes a normalized JSONL file.
    Each line: { "type": "CVE", "cve_id": ..., "cvss_v3": ..., "published_date": ..., "description": ... }
    \"\"\"
    try:
        logger.info("Parsing NVD JSON feed")
        if not nvd_data:
            logger.warning("No NVD data received for parsing.")
            return

        entries = nvd_data.get("CVE_Items", [])
        with open(output_path, "w", encoding="utf-8") as out_f:
            for item in tqdm(entries, desc="NVD → JSONL"):
                cve_meta = item.get("cve", {}).get("CVE_data_meta", {})
                cve_id = cve_meta.get("ID")
                desc_data = item.get("cve", {}).get("description", {}).get("description_data", [])
                description = ""
                for d in desc_data:
                    if d.get("lang") == "en":
                        description = d.get("value", "")
                        break
                
                cvss_v3_data = item.get("impact", {}).get("baseMetricV3", {}).get("cvssV3", {})
                cvss_v2_data = item.get("impact", {}).get("baseMetricV2", {}).get("cvssV2", {})
                
                cvss_info = {}
                if cvss_v3_data and cvss_v3_data.get("baseScore") is not None:
                    cvss_info = {
                        "version": "3.x",
                        "baseScore": cvss_v3_data.get("baseScore"),
                        "severity": cvss_v3_data.get("baseSeverity"),
                        "vectorString": cvss_v3_data.get("vectorString"),
                    }
                elif cvss_v2_data and cvss_v2_data.get("baseScore") is not None: # Fallback to CVSSv2
                     cvss_info = {
                        "version": "2.0",
                        "baseScore": cvss_v2_data.get("baseScore"),
                        "severity": cvss_v2_data.get("severity"),
                        "vectorString": cvss_v2_data.get("vectorString"),
                    }

                published_date = item.get("publishedDate")
                last_modified_date = item.get("lastModifiedDate")

                norm_record = {
                    "type": "CVE",
                    "source": "NVD",
                    "cve_id": cve_id,
                    "cvss": cvss_info, # Combined CVSS info
                    "published_date": published_date,
                    "last_modified_date": last_modified_date,
                    "description": description,
                    "references": [ref.get("url") for ref in item.get("cve", {}).get("references", {}).get("reference_data", [])]
                }
                out_f.write(json.dumps(norm_record) + "\\n")
        logger.info(f"Wrote parsed CVEs to {output_path}")
    except Exception as e:
        logger.error(f"Failed parsing NVD JSON: {e}", exc_info=True)

def parse_mitre_stix(stix_data, output_path, framework_name):
    \"\"\"
    Parses MITRE ATT&CK STIX objects and writes a JSONL file containing techniques.
    { "type": "ATT&CK", "framework": "enterprise/ics", "technique_id": ..., "name": ..., "description": ..., "tactics": [...] }
    \"\"\"
    try:
        from io import BytesIO
        import zipfile
        
        logger.info(f"Parsing MITRE STIX feed for {framework_name}")
        if not stix_data:
             logger.warning(f"No MITRE STIX data received for {framework_name}.")
             return

        # If stix_data is bytes and starts with PK (zip signature), decompress. Otherwise assume parsed JSON.
        # The fetch_url now handles JSON parsing, so stix_data should be a dict.
        # The example URL for MITRE includes .zip, so fetch_url needs to handle raw bytes for zip.
        # Let's assume fetch_url(..., is_json=False) was used for zip files.
        
        parsed_stix_data = None
        if isinstance(stix_data, bytes): # If raw bytes from a ZIP file
            if stix_data[:2] == b"PK":
                logger.info(f"Detected ZIP format for MITRE STIX ({framework_name}); decompressing")
                with zipfile.ZipFile(BytesIO(stix_data)) as z:
                    json_fnames = [f for f in z.namelist() if f.endswith(".json")]
                    if not json_fnames:
                        raise ValueError("No JSON file found inside STIX ZIP")
                    with z.open(json_fnames[0]) as json_file:
                        parsed_stix_data = json.load(json_file)
            else: # Not a zip, try to decode as JSON directly if it's bytes
                try:
                    parsed_stix_data = json.loads(stix_data.decode('utf-8'))
                except Exception as e_decode:
                    logger.error(f"STIX data for {framework_name} is bytes but not ZIP or valid JSON: {e_decode}")
                    return
        elif isinstance(stix_data, dict): # Already parsed JSON
            parsed_stix_data = stix_data
        else:
            logger.error(f"Unexpected data type for MITRE STIX ({framework_name}): {type(stix_data)}")
            return

        if not parsed_stix_data:
            logger.error(f"Failed to obtain parsed JSON from STIX data for {framework_name}.")
            return

        objects = parsed_stix_data.get("objects", [])
        with open(output_path, "w", encoding="utf-8") as out_f:
            for obj in tqdm(objects, desc=f"ATT&CK {framework_name} → JSONL"):
                if obj.get("type") == "attack-pattern": # Corrected hyphen
                    tech_id = ""
                    # Find external ID (Txxxx)
                    for ref in obj.get("external_references", []):
                        if ref.get("source_name") == "mitre-attack" or ref.get("source_name") == f"mitre-ics-attack":
                            tech_id = ref.get("external_id", "")
                            break
                    
                    name = obj.get("name", "")
                    description = obj.get("description", "").strip()
                    tactics = [phase.get("phase_name") for phase in obj.get("kill_chain_phases", []) if phase.get("kill_chain_name") in ["mitre-attack", "mitre-ics-attack"]]
                    platforms = obj.get("x_mitre_platforms", [])
                    data_sources = obj.get("x_mitre_data_sources", [])
                    created = obj.get("created")
                    modified = obj.get("modified")

                    norm_record = {
                        "type": "ATT&CK",
                        "source": "MITRE",
                        "framework": framework_name,
                        "technique_id": tech_id,
                        "name": name,
                        "description": description,
                        "tactics": tactics,
                        "platforms": platforms,
                        "data_sources": data_sources,
                        "created_date": created,
                        "modified_date": modified
                    }
                    out_f.write(json.dumps(norm_record) + "\\n")
        logger.info(f"Wrote parsed ATT&CK {framework_name} techniques to {output_path}")
    except Exception as e:
        logger.error(f"Failed parsing MITRE STIX for {framework_name}: {e}", exc_info=True)


def parse_cisa_rss(rss_url, output_path, alert_type_name):
    \"\"\"
    Parses a CISA RSS feed and writes a normalized JSONL file.
    Each line: { "type": alert_type_name, "title": ..., "link": ..., "published_date": ..., "summary": ... }
    \"\"\"
    try:
        logger.info(f"Fetching and parsing CISA RSS feed: {rss_url} as {alert_type_name}")
        # feedparser handles fetching internally
        feed_data = feedparser.parse(rss_url) 
        
        if feed_data.bozo: # Check for errors during parsing
            bozo_exception = feed_data.bozo_exception
            logger.warning(f"Warning parsing RSS feed {rss_url} (might be malformed or fetch error): {bozo_exception}")
            # Continue if entries exist, otherwise return
            if not feed_data.entries:
                 logger.error(f"No entries found and bozo flag set for {rss_url}. Skipping.")
                 return

        with open(output_path, "w", encoding="utf-8") as out_f:
            for entry in tqdm(feed_data.entries, desc=f"{alert_type_name} → JSONL"):
                title = entry.get("title", "")
                link = entry.get("link", "")
                
                published_date_parsed = entry.get("published_parsed")
                published_date_iso = ""
                if published_date_parsed:
                    try:
                        # Create datetime object, assume UTC if not specified by feedparser
                        dt_obj = datetime(*published_date_parsed[:6])
                        # If feedparser doesn't provide tzinfo, assume UTC for ISO formatting consistency
                        if dt_obj.tzinfo is None:
                            dt_obj = dt_obj.replace(tzinfo=timezone.utc)
                        published_date_iso = dt_obj.isoformat()
                    except Exception as e_date:
                        logger.warning(f"Could not parse date for RSS entry '{title}': {e_date}. Using raw: {entry.get('published')}")
                        published_date_iso = entry.get("published", "") # Fallback to raw string
                else:
                     published_date_iso = entry.get("published", "")


                summary = entry.get("summary", "")
                # Basic HTML stripping (consider BeautifulSoup for complex HTML)
                # import re 
                # summary = re.sub('<[^<]+?>', '', summary).strip()

                norm_record = {
                    "type": alert_type_name, # e.g. "CISA_ALERT", "CISA_ACTIVITY"
                    "source": "CISA",
                    "title": title,
                    "link": link,
                    "published_date": published_date_iso,
                    "summary": summary.strip(),
                }
                out_f.write(json.dumps(norm_record) + "\\n")
        logger.info(f"Wrote parsed {alert_type_name} to {output_path}")
    except Exception as e:
        logger.error(f"Failed parsing CISA RSS feed {rss_url}: {e}", exc_info=True)


def parse_msrc_api(output_path, lookback_days=1):
    \"\"\"
    Fetches recent MSRC vulnerabilities and writes a normalized JSONL file.
    Filters vulnerabilities released in the last 'lookback_days'.
    \"\"\"
    base_url = "https://api.msrc.microsoft.com/update-guide/v1/vulnerabilities"
    
    # Calculate the start date for filtering
    start_date = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    start_date_str = start_date.strftime("%Y-%m-%dT%H:%M:%SZ") # MSRC API expects ISO 8601 format

    # OData filter for releaseDate. Using 'gt' (greater than) for recent items.
    # Or 'ge' (greater than or equal) if precise boundary is needed.
    # For a daily script, 'gt' the start of 'lookback_days' ago is fine.
    query_filter = f"$filter=releaseDate gt {start_date_str}"
    
    current_url = f"{base_url}?{query_filter}"
    api_key = os.getenv("MSRC_API_KEY") # Optional: MSRC API may work without a key for public data but is rate-limited.
    headers = {"Accept": "application/json"}
    if api_key:
        headers["api-key"] = api_key
        logger.info("Using MSRC_API_KEY for MSRC API.")
    else:
        logger.info("No MSRC_API_KEY found, accessing MSRC API without authentication (may be rate-limited).")

    all_msrc_vulns = []
    page_num = 1

    logger.info(f"Fetching MSRC vulnerabilities released after {start_date_str}")

    while current_url:
        logger.info(f"Fetching MSRC page: {page_num} from {current_url.split('?')[0]}...") # Log base URL to avoid logging full query if sensitive
        try:
            # Using requests directly for more control over headers and potential API key
            resp = requests.get(current_url, headers={**{"User-Agent": DEFAULT_USER_AGENT}, **headers}, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            
            all_msrc_vulns.extend(data.get("value", []))
            
            # MSRC API uses @odata.nextLink for pagination
            current_url = data.get("@odata.nextLink")
            page_num += 1
            if not current_url:
                logger.info("No more MSRC pages to fetch.")
                break
        except requests.RequestException as e:
            logger.error(f"Error fetching MSRC data from {current_url.split('?')[0]}: {e}")
            break 
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON from MSRC {current_url.split('?')[0]}: {e}")
            break


    if not all_msrc_vulns:
        logger.info(f"No MSRC vulnerabilities found for the period after {start_date_str}.")
        # Create an empty file to signify completion if no data, or just skip.
        # open(output_path, 'w').close() 
        return

    try:
        with open(output_path, "w", encoding="utf-8") as out_f:
            for vuln in tqdm(all_msrc_vulns, desc="MSRC → JSONL"):
                cve_number = vuln.get("cveNumber")
                release_date = vuln.get("releaseDate")
                name = vuln.get("vulnerabilityName") # This is often the title
                description = vuln.get("description", {}).get("value","") # Description seems to be in a nested structure for some CVRF versions

                # Extract CVSS - MSRC provides a list, pick the most relevant (e.g., highest base score or specific provider)
                cvss_info = {}
                best_cvss = None
                for cvss_set in vuln.get("cvssScoreSets", []):
                    if cvss_set.get("baseScore") is not None: # Ensure there's a base score
                        if best_cvss is None or cvss_set.get("baseScore") > best_cvss.get("baseScore", 0):
                             # Prefer CVSS v3 if available and provider is Microsoft
                            if "cvssV3" in cvss_set.get("vector","").lower() or "CVSS:3" in cvss_set.get("vector",""):
                                best_cvss = cvss_set
                            elif best_cvss is None: # Fallback if no V3 found yet
                                best_cvss = cvss_set
                
                if best_cvss:
                    cvss_info = {
                        "baseScore": best_cvss.get("baseScore"),
                        "severity": best_cvss.get("severity"), # MSRC CVSS severity might differ from NVD's interpretation
                        "vectorString": best_cvss.get("vector"),
                    }

                affected_products_summary = []
                for prod in vuln.get("affectedProducts", []):
                    affected_products_summary.append(
                        f"{prod.get('productFamily', 'Unknown Family')} - {prod.get('productName', 'Unknown Product')}"
                    )
                
                # Consolidate tags/flags
                exploited_status = vuln.get("exploited", "Unknown") # e.g., "Yes", "No", "Yes - Publicly Disclosed"
                publicly_disclosed = vuln.get("publiclyDisclosed", "Unknown")

                norm_record = {
                    "type": "MSRC_BULLETIN",
                    "source": "Microsoft",
                    "cve_id": cve_number, # MSRC bulletins are usually tied to a CVE
                    "title": name,
                    "description": description.strip(),
                    "published_date": release_date,
                    "cvss": cvss_info,
                    "affected_products": affected_products_summary, # List of strings
                    "exploited_status": exploited_status,
                    "publicly_disclosed": publicly_disclosed,
                    "msrc_url": f"https://msrc.microsoft.com/update-guide/vulnerability/{cve_number}" if cve_number else ""
                }
                out_f.write(json.dumps(norm_record) + "\\n")
        logger.info(f"Wrote parsed MSRC vulnerabilities to {output_path}")
    except Exception as e:
        logger.error(f"Failed writing MSRC data to {output_path}: {e}", exc_info=True)


def main(output_dir, lookback_days):
    os.makedirs(output_dir, exist_ok=True)
    today = datetime.utcnow().strftime("%Y%m%d")
    logger.info(f"Starting threat intelligence ingestion for {today}. Output directory: {output_dir}")
    logger.info(f"Data lookback for APIs (like MSRC): {lookback_days} day(s).")

    # 1) Fetch & parse NVD recent CVE feed
    nvd_url = "https://nvd.nist.gov/feeds/json/cve/1.1/nvdcve-1.1-recent.json.gz"
    # fetch_url returns parsed JSON directly if is_json=True (default)
    nvd_data = fetch_url(nvd_url, decompress_gzip=True, is_json=True) 
    if nvd_data:
        parse_nvd_json(nvd_data, os.path.join(output_dir, f"cve_nvd_{today}.jsonl"))
    else:
        logger.warning("Skipping NVD parsing due to fetch error.")

    # 2) Fetch & parse MITRE ATT&CK Enterprise STIX
    mitre_enterprise_url = "https://cti-taxii.mitre.org/stix/collections/95ecc380-afe9-11e4-9b6c-751b66dd541e/stix-2.1.zip"
    # For ZIP files, fetch as raw bytes first
    mitre_enterprise_bytes = fetch_url(mitre_enterprise_url, is_json=False) 
    if mitre_enterprise_bytes:
        parse_mitre_stix(mitre_enterprise_bytes, os.path.join(output_dir, f"attack_enterprise_{today}.jsonl"), "enterprise")
    else:
        logger.warning("Skipping MITRE Enterprise parsing due to fetch error.")

    # 3) Fetch & parse MITRE ATT&CK ICS STIX
    mitre_ics_url = "https://cti-taxii.mitre.org/stix/collections/02c3ef24-9cd4-48f3-a99f-679424e34d7e/stix-2.1.zip"
    mitre_ics_bytes = fetch_url(mitre_ics_url, is_json=False)
    if mitre_ics_bytes:
        parse_mitre_stix(mitre_ics_bytes, os.path.join(output_dir, f"attack_ics_{today}.jsonl"), "ics")
    else:
        logger.warning("Skipping MITRE ICS parsing due to fetch error.")
        
    # 4) Fetch & parse CISA Alerts RSS
    cisa_alerts_url = "https://www.cisa.gov/uscert/ncas/alerts.xml"
    parse_cisa_rss(cisa_alerts_url, os.path.join(output_dir, f"cisa_alerts_{today}.jsonl"), "CISA_ALERT")
    
    # 5) Fetch & parse CISA Current Activity RSS
    cisa_activity_url = "https://www.cisa.gov/uscert/ncas/current-activity.xml"
    parse_cisa_rss(cisa_activity_url, os.path.join(output_dir, f"cisa_activity_{today}.jsonl"), "CISA_ACTIVITY")

    # 6) Fetch & parse MSRC API Bulletins
    parse_msrc_api(os.path.join(output_dir, f"msrc_bulletins_{today}.jsonl"), lookback_days=lookback_days)

    logger.info("Intel ingestion complete.")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Daily threat feed ingestion script v2")
    p.add_argument(
        "--output_dir",
        required=True,
        help="Directory to write parsed JSONL output files.",
    )
    p.add_argument(
        "--lookback_days",
        type=int,
        default=1,
        help="Number of days to look back for date-filterable APIs like MSRC (default: 1 day)."
    )
    args = p.parse_args()
    
    # Configure file handler for logging if needed
    # log_file_path = os.path.join(args.output_dir, f"intel_ingest_{datetime.utcnow().strftime('%Y%m%d')}.log")
    # fh = logging.FileHandler(log_file_path)
    # fh.setLevel(logging.DEBUG)
    # fh.setFormatter(formatter)
    # logger.addHandler(fh)
    
    main(args.output_dir, args.lookback_days)
"""
}
