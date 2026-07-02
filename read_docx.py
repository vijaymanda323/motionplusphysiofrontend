import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_docx(docx_path):
    try:
        with zipfile.ZipFile(docx_path, 'r') as zf:
            xml_content = zf.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for node in tree.iterfind('.//w:t', namespaces):
                if node.text:
                    text.append(node.text)
            return '\n'.join(text)
    except Exception as e:
        return f"Error reading {docx_path}: {e}"

if __name__ == '__main__':
    files = [
        r"d:\motionphysio1\motionphysio\assets\Bingo for Pain.docx",
        r"d:\motionphysio1\motionphysio\assets\Human Hardware Scan.docx",
        r"d:\motionphysio1\motionphysio\assets\Insights.docx",
        r"d:\motionphysio1\motionphysio\assets\Muscle Health Challenge.docx"
    ]
    with open('output.txt', 'w', encoding='utf-8') as f_out:
        for f in files:
            f_out.write(f"--- CONTENT OF {os.path.basename(f)} ---\n")
            f_out.write(extract_text_from_docx(f))
            f_out.write("\n\n")
