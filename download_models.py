from facenet_pytorch import MTCNN, InceptionResnetV1
import torch

def download():
    print("Downloading MTCNN...")
    MTCNN(device='cpu')
    print("Downloading InceptionResnetV1...")
    InceptionResnetV1(pretrained='vggface2').eval().to('cpu')
    print("Pre-download complete!")

if __name__ == "__main__":
    download()
