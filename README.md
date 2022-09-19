# Mutational Signature Analysis tool

This is framework for identifying specific genes through the analysis of the association study between mutational signature and gene expression.
Go to the page below to see the results of the sample data.

https://altaaaaaaa.github.io/SigAnalysis-B/

## <a name="How to execute code"></a> How to execute code

To install the current version of this Github repo, git clone this repo or download the zip file.
Unzip the contents of SigProfilerExtractor-master.zip or the zip file of a corresponding branch.

In the command line, please run the following:
```bash
$ python CODE.py --data_folder=[datafolder name] --deseq_folder=[deseq result foloder name]
```

[datafolder name] => yMat = mutation count(vcf file to csv), result of Sigprofiler 
[deseqfolder name] => result of DESeq(tsv)



| Category | Parameter | Variable Type | Parameter Description |
| --------- | --------------------- | -------- |-------- |
| **Input Data** |  |  | |
|  | **input_type** | String | The type of input:<br><ul><li>"vcf": used for vcf format inputs.</li><li>"matrix": used for table format inputs using a tab seperated file.</li><li>"bedpe": used for bedpe file with each SV annotated with its type, size bin, and clustered/non-clustered status.</li><li>"seg:TYPE": used for a multi-sample segmentation file for copy number analysis. The accepted callers for TYPE are the following {"ASCAT", "ASCAT_NGS", "SEQUENZA", "ABSOLUTE", "BATTENBERG", "FACETS", "PURPLE", "TCGA"}. For example, when using segmentation file from BATTENBERG then set input_type to "seg:BATTENBERG".</li></ul> |
|  | **output** | String | The name of the output folder. The output folder will be generated in the current working directory.  |
|  | **input_data** | String | <br>Path to input folder for input_type:<ul><li>vcf</li><li>bedpe</li></ul>Path to file for input_type:<ul><li>matrix</li><li>seg:TYPE</li></ul> |
|  | **reference_genome** | String | The name of the reference genome. The default reference genome is "GRCh37". This parameter is applicable only if the input_type is "vcf". | 
|  | **opportunity_genome** | String | The build or version of the reference genome for the reference signatures. The default opportunity genome is GRCh37. If the input_type is "vcf", the opportunity_genome automatically matches the input reference genome value. Only the genomes available in COSMIC are supported (GRCh37, GRCh38, mm9, mm10 and rn6). If a different opportunity genome is selected, the default genome GRCh37 will be used. | 
|  | **context_type** | String | A string of mutaion context name/names separated by comma (","). The items in the list defines the mutational contexts to be considered to extract the signatures. The default value is "96,DINUC,ID", where "96" is the SBS96 context, "DINUC" is the DINUCLEOTIDE context and ID is INDEL context. | 
|  | **exome** | Boolean | Defines if the exomes will be extracted. The default value is "False".  | 