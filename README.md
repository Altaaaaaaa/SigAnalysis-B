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
|  | **input_type** | String | The type of input:<br>"vcf": used for vcf format inputs. Input data is signature analysis data obtained as a result of sigprofiler. As input data of sigprofiler, a somatic mutation dataset was used.  |
|  | **output** | String | The name of the output folder. The output folder will be generated in the current working directory.  |
|  | **input_data** | String | <br>Path to input folder for input_type:<ul><li>vcf</li><li>bedpe</li></ul>Path to file for input_type:<ul><li>matrix</li><li>seg:TYPE</li></ul> |
|  | **reference_genome** | String | The name of the reference genome. The default reference genome is "GRCh38". This parameter is applicable only if the input_type is "vcf". | 
|  | **DESeq data** | String | DESeq represents the result of DEG analysis by obtaining the LogFC value of the mutation dataset, and refers to gene expression data. | 
|  | **Used data** | String | DESeq represents the result of DEG analysis by obtaining the LogFC value of the mutation dataset, and refers to gene expression data. | 
