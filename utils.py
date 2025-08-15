# utils_pest.py
import torch
from PIL import Image
from torchvision import transforms
import torchvision.models as models
import json

# Load pest model
model = models.resnet50(weights=None)
model.fc = torch.nn.Linear(model.fc.in_features, 102)
state_dict = torch.load("models/resnet50_0.497.pkl", map_location='cpu', weights_only=False)

model.load_state_dict(state_dict)
model.eval()

pest_labels = [
    "rice leaf roller", "rice leaf caterpillar", "paddy stem maggot", "asiatic rice borer",
    "yellow rice borer", "rice gall midge", "Rice Stemfly", "brown plant hopper",
    "white backed plant hopper", "small brown plant hopper", "rice water weevil", "rice leafhopper",
    "grain spreader thrips", "rice shell pest", "grub", "mole cricket", "wireworm", 
    "white margined moth", "black cutworm", "large cutworm", "yellow cutworm", "red spider", 
    "corn borer", "army worm", "aphids", "Potosiabre vitarsis", "peach borer", 
    "english grain aphid", "green bug", "bird cherry-oataphid", "wheat blossom midge", 
    "penthaleus major", "longlegged spider mite", "wheat phloeothrips", "wheat sawfly", 
    "cerodonta denticornis", "beet fly", "flea beetle", "cabbage army worm", 
    "beet army worm", "Beet spot flies", "meadow moth", "beet weevil", 
    "sericaorient alismots chulsky", "alfalfa weevil", "flax budworm", 
    "alfalfa plant bug", "tarnished plant bug", "Locustoidea", "lytta polita", 
    "legume blister beetle", "blister beetle", "therioaphis maculata Buckton", 
    "odontothrips loti", "Thrips", "alfalfa seed chalcid", "Pieris canidia", 
    "Apolygus lucorum", "Limacodidae", "Viteus vitifoliae", "Colomerus vitis", 
    "Brevipoalpus lewisi McGregor", "oides decempunctata", "Polyphagotars onemus latus", 
    "Pseudococcus comstocki Kuwana", "parathrene regalis", "Ampelophaga", 
    "Lycorma delicatula", "Xylotrechus", "Cicadella viridis", "Miridae", 
    "Trialeurodes vaporariorum", "Erythroneura apicalis", "Papilio xuthus", 
    "Panonchus citri McGregor", "Phyllocoptes oleiverus ashmead", "Icerya purchasi Maskell", 
    "Unaspis yanonensis", "Ceroplastes rubens", "Chrysomphalus aonidum", 
    "Parlatoria zizyphus Lucus", "Nipaecoccus vastalor", "Aleurocanthus spiniferus", 
    "Tetradacus c Bactrocera minax", "Dacus dorsalis(Hendel)", "Bactrocera tsuneonis", 
    "Prodenia litura", "Adristyrannus", "Phyllocnistis citrella Stainton", 
    "Toxoptera citricidus", "Toxoptera aurantii", "Aphis citricola Vander Goot", 
    "Scirtothrips dorsalis Hood", "Dasineura sp", "Lawana imitata Melichar", 
    "Salurnis marginella Guerr", "Deporaus marginatus Pascoe", "Chlumetia transversa", 
    "Mango flat beak leafhopper", "Rhytidodera bowrinii white", "Sternochetus frigidus", 
    "Cicadellidae"
]

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

def classify_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        outputs = model(img_tensor)
        pred_class = torch.argmax(outputs, 1).item()
        confidence = torch.nn.functional.softmax(outputs, dim=1)[0][pred_class].item()
    return pest_labels[pred_class], round(confidence * 100, 2)
