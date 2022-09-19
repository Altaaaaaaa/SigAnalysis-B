import os
import argparse
import string
import sys
from Bio import SeqIO
import time
import pandas as pd
import numpy as np
import scipy.stats as stat
from numpy import dot
from numpy.linalg import norm
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from pdf2image import convert_from_path

# 인자값을 받을 수 있는 인스턴스 생성
parser = argparse.ArgumentParser(description='mutational signature analysis program')

# 입력받을 인자값 등록
parser.add_argument('--data_folder', required=True, help='data folder')
# parser.add_argument('--process', required=True, help='process data')
# parser.add_argument('--exposure', required=True, help='exposure data')
parser.add_argument('--deseq_folder', required=True, help='deseq data folder')

# 입력받은 인자값을 args에 저장 (type: namespace)
args = parser.parse_args()


yMatList = []
dirName = args.data_folder #'data' # 입력받기

for fName in os.listdir(dirName + "/yMat"):
    if fName[-4:] == '.csv':
        yMatList.append(pd.read_csv(dirName + "/yMat/" + fName, index_col=0)) # [:11]
        

P = pd.read_csv(dirName + "/results/SBS96/Suggested_Solution/SBS96_De-Novo_Solution/Signatures/SBS96_De-Novo_Signatures.txt", sep='\t', index_col=0) #Extractor 결과 중 process 사용
E = pd.read_csv(dirName + "/results/SBS96/Suggested_Solution/SBS96_De-Novo_Solution/Activities/SBS96_De-Novo_Activities_refit.txt", sep='\t', index_col=0) #Extractor 결과 중 exposure 사용

#E = E.T

samples = E.index

sig = P.columns
types = P.index

# total -> 분자 합

contri_list = []
contri_name_list = []

for s in range(len(samples)):
    df = pd.DataFrame()
    for j in range(len(types)):
        numerator = []
        sum = 0.0
        for i in range(len(sig)):
            p = P.iloc[j, i]
            e = E.iloc[s, i]
            result = p * e
            numerator.append(result)
            sum += result
        for ss in range(len(sig)):
            if sum == 0.0:
                df.loc[j, ss] = 0
            else:
                df.loc[j, ss] = numerator[ss] / sum
        #print(samples[s])
    #df.to_csv('output/C/' + samples[s] + '_C.csv') # contribution 결과 파일
    contri_list.append(df)
    contri_name_list.append(samples[s])

# print(contri_name_list)
# print(contri_list)

cList = []
DESeq = []
column = ['gene', 'sig']

deseq_folder = args.deseq_folder #'/DESeq' # DESeq 폴더 위치 입력받기
output_folder = '/output'

for i in range(len(contri_name_list)):
    cList.append(contri_list[i])
    column.append(contri_name_list[i])

column.extend(column[2:7])
column.extend(['c', 'p'])

for fName in os.listdir(dirName + deseq_folder):
    if fName[-4:] == '.tsv':
        DESeq.append(pd.read_csv(dirName + deseq_folder + "/" + fName, sep='\t')) # 입력받는 파일

df = pd.DataFrame(columns=column)

index = 0
genes = yMatList[0].columns
sig = cList[0].columns
types = yMatList[0].index

count = 0

for gene in genes:  # 정수인지, 합 확인
    for s in range(len(P.columns)): # P.columns = signature 개수
        df.loc[index, 0:2] = [gene, s]
        v1 = []
        for i in range(len(yMatList)):
            sum = 0
            type_i = 0
            for type in types:
                sum += yMatList[i].loc[type, gene] * cList[i].iloc[type_i, int(s)]
                type_i += 1
            v1.append(sum)
        df.loc[index, 2:7] = tuple(map(str, v1))
        log_ = []
        for i in range(len(DESeq)):
            log_.append(DESeq[i].loc[gene, 'log2FoldChange'])
        df.loc[index, 7:12] = tuple(map(str, log_))
        r = np.nan
        p_value = np.nan
        if np.isfinite(log_[0]):
            r, p_value = stat.pearsonr(v1, log_)
        df.loc[index, 12:14] = [r, p_value]
        index += 1
    count += 1
    if count % 1000 == 0:
        print(count, "/ 58440", str(count / 58440 * 100) + "%") # 진행률 나타냄


AllRpath = output_folder + '/AllResult'
os.makedirs(AllRpath, exist_ok=True)

df.to_csv(output_folder + '/AllResult/ResultMat.csv')  # 이게 제공하는 전체 파일

AllResult = df

PartRe_list = []
Final_list = []
Selpath = output_folder + '/Selected_Result'
Fipath = output_folder + '/Final'
os.makedirs(Selpath, exist_ok=True) # 폴더 경로 지정 후 없으면 폴더 만들기
os.makedirs(Fipath, exist_ok=True)

for s in range(len(P.columns)):  # 시그니쳐 개수에 따라 range 변경
    df = pd.DataFrame(columns=AllResult.columns)  # columns=columns
    idx = 0
    for i in range(len(AllResult)):  # 총 행만큼 반복하기
        if AllResult.iloc[i, 12] == '' or AllResult.iloc[i, 13] == '': continue
        # Num = int(AllResult.iloc[i,0])
        Sig = int(AllResult.iloc[i, 1])
        Cor = float(AllResult.iloc[i, 12])
        P_val = float(AllResult.iloc[i, 13])
        if Sig == s and Cor <= -0.9 and P_val <= 0.05:
            # print(Sig, Cor, P_val) # 확인을 위해서 출력
            df.loc[idx, :] = AllResult.iloc[i, :]
            idx += 1
    df.drop(df.columns[1], axis=1)
    df.to_csv(Selpath + '/ResultMat_Sig' + str(s) + '.csv', sep=',', index=True, header=True)  # 이거 표로 출력
    PartRe_list.append(df)
#     print('Done Sig' + str(s))

for i in range(len(PartRe_list)):
    columns = []

    df = PartRe_list[i].iloc[:, 2:12]
    df = df.T
    df = df.astype(float).mean(axis=1)

    data1 = df[:5]
    data2 = df[5:]
    columns.append(PartRe_list[i].iloc[0, 2:7])

    csv = pd.DataFrame()

    data2.index = PartRe_list[i].columns[2:7]

    # csv = csv.append(columns)
    csv = csv.append(data1, ignore_index=True)
    csv = csv.append(data2, ignore_index=True)
    # csv.iloc[-1] = data2

    csv = csv.T

    csv.columns = ["mutation", "DESeq"]

    csv.to_csv(Fipath + '/FinalMat_Sig' + str(i) + '_data.csv')
    Final_list.append(csv)


COSMIC_P = pd.read_csv("C:/Users/user/Desktop/JIONI/BML/PROJECT_SIGTIME_V2/DATA/COSMIC_v2_SBS_GRCh38.txt", sep='\t', index_col=0) # COSMIC의 Signature 30개 # 파일 위치 변경 필요

imgpath = output_folder + '/img'
os.makedirs(imgpath, exist_ok=True)

def cos_sim(A, B):
    return dot(A, B)/(norm(A)*norm(B))

cossim = pd.DataFrame(columns=COSMIC_P.columns, index=P.columns)

for i in range(len(P.columns)):
    sim = []
    cosmax = 0
    p_vector = P[P.columns[i]].values # p_vector에 P행렬의 값 벡터로 변환
    for j in range(len(COSMIC_P.columns)):
        cosp_vector = COSMIC_P[COSMIC_P.columns[j]].values # cosp_vector에 COSMIC_P행렬의 값 벡터로 변환
        simsim = cos_sim(p_vector, cosp_vector)
        sim.append(cos_sim(p_vector, cosp_vector)) # 코사인 유사도 계산한 값 sim 리스트에 추가
        cossim.iloc[i,j] = float(cos_sim(p_vector, cosp_vector))
        #cossim.iloc[i,j] = np.array((cos_sim(p_vector, cosp_vector)), dtype=float)
        if cos_sim(p_vector, cosp_vector) == max(sim): # 만약 계산한 코사인 유사도 값이 sim 리스트에 있는 가장 큰 값이면 j 값 저장
            cosmax = j
    if max(sim) >= 0: # 0.85이상으로 고치기     # sim 리스트의 가장 큰 값 출력
        print(P.columns[i],'is similar to', COSMIC_P.columns[cosmax], ' The similarity is', max(sim))

# heatmap 그리기
cossim2 = cossim.astype(float)

cmapcolor = sns.diverging_palette(220, 20, as_cmap=True)

plt.figure(figsize = (30, len(P.columns))) # (cosmic signature 개수, de novo signature 개수)
sns.heatmap(cossim2, cmap=cmapcolor,
                annot=True,
                fmt=".3f",
                annot_kws={'size':10},
                cbar=True,
                square=True)
plt.title('Cosine Similarity', fontsize=20, fontweight='bold', pad=10)

cossim2 = cossim.astype(float)

plt.savefig(imgpath + "/Heatmap.png", bbox_inches = 'tight', dpi=300, transparent=True) # 플롯을 사진 파일로 저장
# plt.show()

# Mutation&DESeq 그래프 그리기

sns.set_theme()
#gData = []

# Load the penguins dataset
#for fName in os.listdir(Fipath):
#    if fName[-4:] == '.csv':
#        gData.append(pd.read_csv(Fipath + fName, sep=',', index_col=0))
for i in range(len(Final_list)):
    colors = ["#666699", "#80B1D3"]
    sns.set_palette(sns.color_palette(colors))

    # Plot sepal width as a function of sepal_length across days
    g = sns.lmplot(
        data=Final_list[i],
        x="mutation", y="DESeq",
        height=5,
        scatter_kws={"s":80},
    )

    # Use more informative axis labels than are provided by default
    g.set_axis_labels("Mutation", "DESeq")
    left = Final_list[i]["mutation"].min()
    right = Final_list[i]["mutation"].max()
    dis = (right - left) * 0.05
    g.set(xlim=(left-dis, right + dis))
    plt.title("Mutation&DESeq Graph", fontsize=20, fontweight='bold', pad=10)
    plt.show()

    g.savefig(imgpath + "/plot_"+ str(i) + ".png", transparent=True)


# Table 데이터 전처리
Tablepath = output_folder + '/TableData'
os.makedirs(Tablepath, exist_ok=True)

for i in range(len(PartRe_list)):
    TD = pd.DataFrame()
    num = int((len(PartRe_list[i].columns))/2)

    TD = pd.concat([PartRe_list[i].iloc[:,0], PartRe_list[i].iloc[:,2:6], PartRe_list[i].iloc[:,num:num+4], PartRe_list[i].iloc[:,-2:]], axis=1)

    TD.columns = ['gene', 'Mut-S1', 'Mut-S2', 'Mut-S3', 'Mut-S4', 'Mut-S5', 'DESeq-S1', 'DESeq-S2', 'DESeq-S3', 'DESeq-S4', 'DESeq-S5', 'Correlation', 'P-value']
    #pd.options.display.float_format = '{:.2f}'.format

    TD.to_csv(Tablepath + '/TableMat_Sig' + str(i) + '.csv', sep=',', index=True, header=True)  # 이거 표로 출력


# pdf to png

file_name = "SBS96_selection_plot.pdf"
pages = convert_from_path(dirName + "/results/SBS96/" + file_name)
for i, page in enumerate(pages):
    page.save(imgpath + file_name + str(i) + ".jpg", "JPEG")

file_name = "SBS_96_plots_SBS96_De-Novo.pdf"
pages = convert_from_path(dirName + "/results/SBS96/Suggested_Solution/SBS96_De-Novo_Solution/Signatures/" + file_name)
for i, page in enumerate(pages):
    page.save(imgpath + file_name + str(i) + ".jpg", "JPEG")